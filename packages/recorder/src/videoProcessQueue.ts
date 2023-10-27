import { BrowserWindow } from 'electron';
import path from 'path';
import SizeMonitor from './sizeMonitor';
import ConfigService from './configService';
import { Metadata, SaveStatus, VideoQueueItem } from './types';
import { tryUnlink, writeMetadataFile, getThumbnailFileNameForVideo } from './util';
import Queue, { DoneCallback, Job } from 'bee-queue';
import pathTo from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';

console.log('ffpath', pathTo);

ffmpeg.setFfmpegPath(pathTo || '');

export default class VideoProcessQueue {
  private videoQueue: Queue<VideoQueueItem> = null!;

  private mainWindow: BrowserWindow;

  private cfg = ConfigService.getInstance();

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.setupVideoProcessingQueue();
  }

  private setupVideoProcessingQueue() {
    this.videoQueue = new Queue<VideoQueueItem>('video-processing');
    this.videoQueue.process<void>(this.processVideoQueueItem);
    this.videoQueue.on('succeeded', async (job: Job<VideoQueueItem>) => {
      this.finishProcessingVideo(job);
      const counts = await this.videoQueue.checkHealth();
      if (counts.active + counts.waiting + counts.delayed === 0) this.videoQueueEmpty();
    });
    this.videoQueue.on('failed', VideoProcessQueue.errorProcessingVideo);
  }

  public async queueVideo(bufferFile: string, metadata: Metadata, filename: string, relativeStart: number) {
    const queueItem: VideoQueueItem = {
      bufferFile,
      metadata,
      filename,
      relativeStart,
    };

    console.log('[VideoProcessQueue] Queuing video for processing', queueItem);
    const newJob = this.videoQueue.createJob(queueItem);
    newJob.on('failed', VideoProcessQueue.errorProcessingVideo);
    newJob.save();
  }

  private async processVideoQueueItem(job: Job<VideoQueueItem>, done: DoneCallback<void>): Promise<void> {
    console.info('[VideoProcessQueue] Now processing video', job.data.bufferFile);
    this.mainWindow.webContents.send('updateSaveStatus', SaveStatus.Saving);

    const data = job.data;
    const { duration } = data.metadata;

    const isLongEnough = true; // TODO: re-implement this feature

    if (duration === null || duration === undefined) {
      throw new Error('[VideoProcessQueue] Null or undefined duration');
    }

    if (!isLongEnough) {
      console.info('[VideoProcessQueue] Encounter was too short, discarding');
      done(null);
      return;
    }

    const videoPath = await VideoProcessQueue.cutVideo(
      data.bufferFile,
      this.cfg.get<string>('storagePath'),
      data.filename,
      data.relativeStart,
      data.metadata.duration + data.metadata.overrun,
    );

    await writeMetadataFile(videoPath, data.metadata);
    await tryUnlink(data.bufferFile);

    await VideoProcessQueue.getThumbnail(videoPath);

    done(null);
  }

  private static errorProcessingVideo(err: any) {
    console.error('[VideoProcessQueue] Error processing video', err);
  }
  private finishProcessingVideo(job: Job<VideoQueueItem>) {
    console.log('[VideoProcessQueue] Finished processing video', job.data.bufferFile);

    this.mainWindow.webContents.send('updateSaveStatus', SaveStatus.NotSaving);
    this.mainWindow.webContents.send('refreshState');
  }

  private async videoQueueEmpty() {
    console.log('[VideoProcessQueue] Video processing queue empty');
    new SizeMonitor(this.mainWindow).run();
  }

  /**
   * Sanitize a filename and replace all invalid characters with a space.
   *
   * Multiple consecutive invalid characters will be replaced by a single space.
   * Multiple consecutive spaces will be replaced by a single space.
   */
  private static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[<>:"/|?*]/g, ' ') // Replace all invalid characters with space
      .replace(/ +/g, ' '); // Replace multiple spaces with a single space
  }

  /**
   * Takes an input MP4 file, trims the footage from the start of the video so
   * that the output is desiredDuration seconds. Some ugly async/await stuff
   * here. Some interesting implementation details around ffmpeg in comments
   * below.
   *
   * @param {string} initialFile path to initial MP4 file
   * @param {string} finalDir path to output directory
   * @param {number} desiredDuration seconds to cut down to
   * @returns full path of the final video file
   */
  private static async cutVideo(
    initialFile: string,
    finalDir: string,
    outputFilename: string | undefined,
    relativeStart: number,
    desiredDuration: number,
  ): Promise<string> {
    const videoFileName = path.basename(initialFile, '.mp4');
    const videoFilenameSuffix = outputFilename ? ` - ${outputFilename}` : '';
    const baseVideoFilename = VideoProcessQueue.sanitizeFilename(videoFileName + videoFilenameSuffix);
    const finalVideoPath = path.join(finalDir, `${baseVideoFilename}.mp4`);

    return new Promise<string>((resolve) => {
      if (relativeStart < 0) {
        console.log('[VideoProcessQueue] Avoiding error by rejecting negative start', relativeStart);

        // eslint-disable-next-line no-param-reassign
        relativeStart = 0;
      }

      console.log('[VideoProcessQueue] Desired duration:', desiredDuration, 'Relative start time:', relativeStart);

      // It's crucial that we don't re-encode the video here as that
      // would spin the CPU and delay the replay being available. I
      // did try this with re-encoding as it has compression benefits
      // but took literally ages. My CPU was maxed out for nearly the
      // same elapsed time as the recording.
      //
      // We ensure that we don't re-encode by passing the "-c copy"
      // option to ffmpeg. Read about it here:
      // https://superuser.com/questions/377343/cut-part-from-video-file-from-start-position-to-end-position-with-ffmpeg
      //
      // This thread has a brilliant summary why we need "-avoid_negative_ts make_zero":
      // https://superuser.com/questions/1167958/video-cut-with-missing-frames-in-ffmpeg?rq=1
      ffmpeg(initialFile)
        .inputOptions([`-ss ${relativeStart}`, `-t ${desiredDuration}`])
        .outputOptions([`-t ${desiredDuration}`, '-c:v copy', '-c:a copy', '-avoid_negative_ts make_zero'])
        .output(finalVideoPath)

        // Handle the end of the FFmpeg cutting.
        .on('end', async (err: any) => {
          if (err) {
            console.log('[VideoProcessQueue] FFmpeg video cut error (1): ', err);
            throw new Error('FFmpeg error when cutting video (1)');
          } else {
            console.log('[VideoProcessQueue] FFmpeg cut video succeeded');
            resolve(finalVideoPath);
          }
        })

        // Handle an error with the FFmpeg cutting. Not sure if we
        // need this as well as the above but being careful.
        .on('error', (err: any) => {
          console.log('[VideoProcessQueue] FFmpeg video cut error (2): ', err);
          throw new Error('FFmpeg error when cutting video (2)');
        })
        .run();
    });
  }

  /**
   * Takes an input video file and writes a screenshot a second into the
   * video to disk. Going further into the file seems computationally
   * expensive, so we avoid that.
   *
   * @param {string} video full path to initial MP4 file
   * @param {string} output path to output directory
   */
  private static async getThumbnail(video: string) {
    const thumbnailPath = getThumbnailFileNameForVideo(video);
    const thumbnailFile = path.basename(thumbnailPath);
    const thumbnailDir = path.dirname(thumbnailPath);

    return new Promise<void>((resolve) => {
      ffmpeg(video)
        .on('end', () => {
          console.info('[VideoProcessQueue] Got thumbnail for', video);
          resolve();
        })
        .on('error', (err: any) => {
          console.error('[VideoProcessQueue] Error getting thumbnail for', video, err);

          throw new Error(err);
        })
        .screenshots({
          timestamps: [0],
          folder: thumbnailDir,
          filename: thumbnailFile,
        });
    });
  }
}
