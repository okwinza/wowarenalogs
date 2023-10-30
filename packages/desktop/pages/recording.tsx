/* eslint-disable no-console */
import { ConfigurationSchema, IOBSDevice, ResolutionOptions } from '@wowarenalogs/recorder';
import { Dropdown, useClientContext } from '@wowarenalogs/shared';
import { useEffect, useState } from 'react';
import {
  TbAlertCircle,
  TbAlertOctagon,
  TbCaretDown,
  TbPlayerStop,
  TbSettings,
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

// more enum bullshit
// const recStatus = ['WaitingForWoW', 'Recording', 'InvalidConfig', 'ReadyToRecord', 'FatalError', 'Overruning'];
const recStates: Record<number, { icon: JSX.Element; message: string }> = {
  [-1]: {
    icon: <TbPlayerStop />,
    message: 'Engine not started',
  },
  0: {
    icon: <TbVideoOff size={32} color="yellow" />,
    message: 'Waiting for WoW process or settings change...',
  },
  1: {
    icon: <TbVideo size={32} color="green" />,
    message: 'Recording active',
  },
  2: {
    icon: <TbAlertCircle size={32} color="red" />,
    message: '',
  },
  3: {
    icon: <TbVideoMinus size={32} color="aqua" />,
    message: 'Ready',
  },
  4: {
    icon: <TbAlertOctagon size={32} color="red" />,
    message: 'Fatal error!',
  },
  5: {
    icon: <TbVideoPlus size={32} />,
    message: 'Recording overrun...',
  },
};

const RecordingConfig = () => {
  const clientContext = useClientContext();
  const [outputAudioOptions, setOutputAudioOptions] = useState<IOBSDevice[]>([]);
  const [configStore, setConfigStore] = useState<ConfigurationSchema | undefined | null>(null);
  const [recordingStatus, setRecordingStatus] = useState(-1);
  const [recordStatusError, setRecordStatusError] = useState('');

  useEffect(() => {
    async function checkAudioDevices() {
      if (window.wowarenalogs.obs.getAudioDevices) {
        const devices = await window.wowarenalogs.obs.getAudioDevices();
        setOutputAudioOptions(devices?.output || []);
      }
      if (window.wowarenalogs.obs.getConfiguration) {
        const config = await window.wowarenalogs.obs.getConfiguration();
        setConfigStore(config);
      }
    }
    checkAudioDevices();
  }, []);

  useEffect(() => {
    async function checkStatus() {
      if (window.wowarenalogs.obs.getRecorderStatus) {
        const status = await window.wowarenalogs.obs.getRecorderStatus();
        setRecordingStatus(status as unknown as number);
        console.log('init', typeof status);
      }
    }
    checkStatus();
  }, []);

  useEffect(() => {
    console.log('config subscribed');
    if (window.wowarenalogs.obs.configUpdated) {
      window.wowarenalogs.obs.configUpdated((_e, newConf) => {
        console.log('new config', newConf);
        setConfigStore(newConf);
      });
    }
    return () => {
      console.log('Config unsubscribed');
      window.wowarenalogs.obs.removeAll_configUpdated_listeners &&
        window.wowarenalogs.obs.removeAll_configUpdated_listeners();
    };
  }, []);

  useEffect(() => {
    if (window.wowarenalogs.obs.recorderStatusUpdated) {
      window.wowarenalogs.obs.recorderStatusUpdated((_e, status, err) => {
        console.log('stat', { status, err });
        setRecordingStatus(status);
        setRecordStatusError(err || '');
      });
    }
    return () => {
      window.wowarenalogs.obs.removeAll_recorderStatusUpdated_listeners &&
        window.wowarenalogs.obs.removeAll_recorderStatusUpdated_listeners();
    };
  }, []);

  const maybeAudioChoice = outputAudioOptions.find((a) => a.id === configStore?.audioOutputDevices);
  const maybeAudioDevice = maybeAudioChoice?.description || 'No device found!';

  const showDebugInfo = process.env.NODE_ENV === 'development' && clientContext.isDesktop;

  return (
    <div className="p-2 gap-2 min-h-screen">
      <div className="text-2xl font-bold mb-2">OBS Recording Settings</div>
      <div className="flex flex-row justify-between">
        <div className="flex flex-col gap-2">
          {recordingStatus !== -1 && (
            <button
              className="btn"
              disabled={recordingStatus !== -1}
              onClick={() => {
                if (window.wowarenalogs.obs.startRecordingEngine) {
                  window.wowarenalogs.obs.startRecordingEngine();
                }
              }}
            >
              Start OBS Engine
            </button>
          )}
          <div className="flex flex-row gap-2 items-center">
            {recStates[recordingStatus] && recStates[recordingStatus].icon}
            {recStates[recordingStatus] && recStates[recordingStatus].message}
            {recordStatusError}
          </div>
          <div>
            <div className="font-bold">Audio Output Device:</div>
            <div className="flex flex-row gap-2 items-center">
              <Dropdown
                menuItems={outputAudioOptions.map((k) => ({
                  onClick: () => {
                    window.wowarenalogs.obs?.setConfig && window.wowarenalogs.obs.setConfig('audioOutputDevices', k.id);
                  },
                  key: k.id,
                  label: k.description,
                }))}
              >
                <TbCaretDown size={20} />
              </Dropdown>
              <div>{maybeAudioDevice}</div>
            </div>
          </div>
          <div>
            <div className="font-bold">Resolution:</div>
            <div className="flex flex-row gap-2 items-center">
              <Dropdown
                menuItems={resolutionOptions.map((k) => ({
                  onClick: () => {
                    window.wowarenalogs.obs?.setConfig && window.wowarenalogs.obs.setConfig('obsOutputResolution', k);
                  },
                  key: k,
                  label: k,
                }))}
              >
                <TbCaretDown size={20} />
              </Dropdown>
              <div>{configStore?.obsOutputResolution}</div>
            </div>
          </div>
          <div>
            <div className="font-bold">VOD Storage Directory:</div>
            <div className="flex flex-row gap-2 items-center">
              <button
                className="btn"
                onClick={async () => {
                  if (window.wowarenalogs.obs.selectFolder) {
                    const folderChoice = await window.wowarenalogs.obs.selectFolder('Select folder to store videos to');
                    if (folderChoice.length > 0) {
                      window.wowarenalogs.obs?.setConfig &&
                        window.wowarenalogs.obs.setConfig('storagePath', folderChoice[0]);
                    }
                  }
                }}
              >
                <TbSettings size={20} />
              </button>
              <div>{configStore?.storagePath}</div>
            </div>
          </div>
        </div>
        {showDebugInfo && (
          <div>
            <button
              className="btn"
              onClick={() => {
                window.wowarenalogs.obs?.startRecording && window.wowarenalogs.obs.startRecording();
              }}
            >
              Test Start Recording
            </button>
            <button
              className="btn"
              onClick={() => {
                window.wowarenalogs.obs?.stopRecording &&
                  window.wowarenalogs.obs.stopRecording({
                    startDate: new Date(),
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
                window.wowarenalogs.obs?.setConfig && window.wowarenalogs.obs.setConfig('storagePath', 'd');
              }}
            >
              Test Erase Storage Path Config
            </button>
            <pre>{JSON.stringify(configStore, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordingConfig;
