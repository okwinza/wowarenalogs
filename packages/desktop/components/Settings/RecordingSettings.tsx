import { ConfigurationSchema, IOBSDevice, RecStatus, ResolutionOptions } from '@wowarenalogs/recorder';
import { Dropdown, useClientContext } from '@wowarenalogs/shared';
import { useEffect, useRef, useState } from 'react';
import {
  TbAlertCircle,
  TbAlertOctagon,
  TbCaretDown,
  TbVideo,
  TbVideoMinus,
  TbVideoOff,
  TbVideoPlus,
} from 'react-icons/tb';

// TODO: Figure out a clean way to share options between the two systems
// Right now, if we export from @recorder anything concrete (ie not just types) we get
// dependencies here on Electron that nextjs won't like
const resolutionOptions: ResolutionOptions[] = [
  '1024x768',
  '1280x720',
  '1280x800',
  '1280x1024',
  '1360x768',
  '1366x768',
  '1440x900',
  '1600x900',
  '1680x1050',
  '1920x1080',
  '1920x1200',
  '2560x1080',
  '2560x1440',
  '2560x1600',
  '3440x1440',
  '3840x1080',
  '3440x1200',
  '3840x1440',
  '3840x1600',
  '3840x2160',
  '5120x1440',
];

const captureModes = [
  {
    key: 'game_capture',
    name: 'Game Capture',
  },
  {
    key: 'monitor_capture',
    name: 'Monitor/Display Capture',
  },
];

// more enum bullshit
// const recStatus = ['WaitingForWoW', 'Recording', 'InvalidConfig', 'ReadyToRecord', 'FatalError', 'Overruning'];
const recStates: Record<RecStatus | 'EngineNotStarted', { icon: JSX.Element; message: string }> = {
  EngineNotStarted: {
    icon: <TbVideo size={32} color="gray" />,
    message: 'Engine not started',
  },
  WaitingForWoW: {
    icon: <TbVideoOff size={32} color="yellow" />,
    message: 'Waiting for WoW process or settings change...',
  },
  Recording: {
    icon: <TbVideo size={32} color="green" />,
    message: 'Recording active',
  },
  InvalidConfig: {
    icon: <TbAlertCircle size={32} color="red" />,
    message: '',
  },
  ReadyToRecord: {
    icon: <TbVideoMinus size={32} color="aqua" />,
    message: 'Ready',
  },
  FatalError: {
    icon: <TbAlertOctagon size={32} color="red" />,
    message: 'Fatal error!',
  },
  Overrunning: {
    icon: <TbVideoPlus size={32} />,
    message: 'Recording overrun...',
  },
};

function PreviewVideoWindow({ key }: { key: string }) {
  const divRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rect = divRef.current?.getBoundingClientRect();
    window.wowarenalogs.obs?.drawPreviewWindow?.(rect?.width || 50, rect?.height || 50, rect?.x || 50, rect?.y || 50);
    return () => {
      window.wowarenalogs.obs?.hidePreviewWindow?.();
    };
  }, []);

  if (!window.wowarenalogs.obs?.drawPreviewWindow) return null;

  return (
    <div
      key={key}
      ref={divRef}
      onClick={() => {
        const rect = divRef.current?.getBoundingClientRect();
        window.wowarenalogs.obs?.drawPreviewWindow?.(
          rect?.width || 50,
          rect?.height || 50,
          rect?.x || 50,
          rect?.y || 50,
        );
      }}
      className="h-[200px] w-[400px]"
    />
  );
}

const RecordingSettings = () => {
  const clientContext = useClientContext();
  const [outputAudioOptions, setOutputAudioOptions] = useState<IOBSDevice[]>([]);
  const [configStore, setConfigStore] = useState<ConfigurationSchema | undefined | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<RecStatus | 'EngineNotStarted'>('EngineNotStarted');
  const [recordStatusError, setRecordStatusError] = useState('');

  const engineStarted = recordingStatus !== 'EngineNotStarted';

  async function checkAudioDevices() {
    if (window.wowarenalogs.obs?.getAudioDevices) {
      const devices = await window.wowarenalogs.obs.getAudioDevices();
      setOutputAudioOptions(devices?.output || []);
    }
    if (window.wowarenalogs.obs?.getConfiguration) {
      const config = await window.wowarenalogs.obs.getConfiguration();
      setConfigStore(config);
    }
  }
  useEffect(() => {
    checkAudioDevices();
  }, []);

  useEffect(() => {
    async function checkStatus() {
      if (window.wowarenalogs.obs?.getRecorderStatus) {
        const status = await window.wowarenalogs.obs.getRecorderStatus();
        setRecordingStatus(status);
      }
    }
    checkStatus();
  }, []);

  useEffect(() => {
    window.wowarenalogs.obs?.configUpdated?.((_e, newConf) => {
      setConfigStore(newConf);
    });
    return () => {
      window.wowarenalogs.obs?.removeAll_configUpdated_listeners?.();
    };
  }, []);

  useEffect(() => {
    window.wowarenalogs.obs?.recorderStatusUpdated?.((_e, status, err) => {
      setRecordingStatus(status);
      setRecordStatusError(err || '');
    });
    return () => {
      window.wowarenalogs.obs?.removeAll_recorderStatusUpdated_listeners?.();
    };
  }, []);

  const maybeAudioChoice = outputAudioOptions.find((a) => a.id === configStore?.audioOutputDevices);
  const maybeAudioDevice = maybeAudioChoice?.description || null;

  const showDebugInfo = process.env.NODE_ENV === 'development' && clientContext.isDesktop;

  return (
    <div className="flex flex-col gap-2">
      <div className="text-2xl font-bold mb-1">Video Recording</div>
      <div
        className="mb-2 label-text"
        onClick={() => window.wowarenalogs.links?.openExternalURL('https://discord.gg/NFTPK9tmJK')}
      >
        For help setting up video recording, please see our pinned guide in the #faq channel on{' '}
        <span className="underline">Discord</span>.
      </div>
      <div className="flex flex-col gap-2">
        {!engineStarted && (
          <button
            className="btn"
            disabled={engineStarted}
            onClick={() => {
              window.wowarenalogs.obs?.startRecordingEngine?.();
              checkAudioDevices();
            }}
          >
            Enable Video Recording
          </button>
        )}
        <div className="flex flex-row gap-2 items-center">
          {recStates[recordingStatus] && recStates[recordingStatus].icon}
          {recStates[recordingStatus] && recStates[recordingStatus].message}
          {recordStatusError}
        </div>
        <div className="flex flex-row flex-wrap gap-2 items-center">
          <Dropdown
            menuItems={outputAudioOptions.map((k) => ({
              onClick: () => {
                window.wowarenalogs.obs?.setConfig?.('audioOutputDevices', k.id);
              },
              key: k.id,
              label: k.description,
            }))}
          >
            <div>{maybeAudioDevice ?? 'Select audio source'}</div>
            <TbCaretDown size={20} />
          </Dropdown>
          <Dropdown
            menuItems={resolutionOptions.map((k) => ({
              onClick: () => {
                window.wowarenalogs.obs?.setConfig?.('obsOutputResolution', k);
              },
              key: k,
              label: k,
            }))}
          >
            <div>{configStore?.obsOutputResolution ?? 'Select video resolution'}</div>
            <TbCaretDown size={20} />
          </Dropdown>
          <Dropdown
            menuItems={captureModes.map((k) => ({
              onClick: () => {
                window.wowarenalogs.obs?.setConfig?.('obsCaptureMode', k.key);
              },
              key: k.key,
              label: k.name,
            }))}
          >
            <div>{captureModes.find((m) => m.key === configStore?.obsCaptureMode)?.name ?? 'Select capture mode'}</div>
            <TbCaretDown size={20} />
          </Dropdown>
          {configStore?.obsCaptureMode === 'monitor_capture' && (
            <Dropdown
              menuItems={[1, 2, 3, 4].map((k) => ({
                onClick: () => {
                  window.wowarenalogs.obs?.setConfig?.('monitorIndex', k);
                },
                key: k.toString(),
                label: k.toString(),
              }))}
            >
              <div>
                {captureModes.find((m) => m.key === configStore?.obsCaptureMode)?.name ?? 'Select capture mode'}
              </div>
              <TbCaretDown size={20} />
            </Dropdown>
          )}
          <div className="form-control">
            <label className="label gap-2 justify-start items-center">
              <input
                type="checkbox"
                className="checkbox"
                checked={configStore?.captureCursor || false}
                onChange={(e) => {
                  window.wowarenalogs.obs?.setConfig?.('captureCursor', e.target.checked);
                }}
              />
              <span className="label-text">Capture cursor</span>
            </label>
          </div>
        </div>
        <div className="flex flex-row-reverse gap-2">
          <input
            type="text"
            placeholder=""
            readOnly
            className="input input-sm input-bordered flex-1"
            value={configStore?.storagePath ?? ''}
          />
          <button
            className="btn btn-sm gap-2"
            onClick={async () => {
              if (window.wowarenalogs.obs?.selectFolder) {
                const folderChoice = await window.wowarenalogs.obs.selectFolder('Select folder to store videos to');
                if (folderChoice.length > 0) {
                  window.wowarenalogs.obs?.setConfig?.('storagePath', folderChoice[0]);
                }
              }
            }}
          >
            Set VOD Directory
          </button>
        </div>
      </div>
      {showDebugInfo && (
        <div className="flex flex-col gap-2">
          <div className="divider" />
          <div className="flex gap-2">
            <button
              className="btn"
              onClick={() => {
                window.wowarenalogs.obs?.startRecording?.();
              }}
            >
              Test Start Recording
            </button>
            <button
              className="btn"
              onClick={() => {
                const now = new Date();
                window.wowarenalogs.obs?.stopRecording?.({
                  // Test: a video starting 10s ago and 5s of overrun
                  // this should write a 15s video
                  startDate: new Date(now.getTime() - 10000),
                  endDate: new Date(),
                  fileName: 'test',
                  overrun: 5,
                });
              }}
            >
              Test Stop Recording
            </button>
            <button
              className="btn"
              onClick={() => {
                window.wowarenalogs.obs?.setConfig?.('storagePath', 'd');
              }}
            >
              Test Erase Storage Path Config
            </button>
          </div>
          <div className="flex flex-col gap-2 ">
            <PreviewVideoWindow key={configStore?.obsCaptureMode || 'no-mode'} />
          </div>
          <textarea className="textarea" readOnly rows={8}>
            {JSON.stringify(configStore, null, 2)}
          </textarea>
        </div>
      )}
    </div>
  );
};

export default RecordingSettings;
