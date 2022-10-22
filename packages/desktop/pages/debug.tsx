import { Button, useAuth, useClientContext } from '@wowarenalogs/shared';

import { useLocalCombatsContext } from '../hooks/localCombats';

const Debug = () => {
  const platform = typeof window !== 'undefined' ? window.wowarenalogs.platform : '';

  const client = useClientContext();
  const combats = useLocalCombatsContext();
  const auth = useAuth();

  return (
    <div className="mt-8 text-white">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col">
          <div>Platform: {platform}</div>
          <div>
            {client.wowInstallations.size} Installations
            {Array.from(client.wowInstallations).map((v) => (
              <div key={v[0]}>{v.join(': ')}</div>
            ))}
          </div>
          <div>Local combat logs: ({combats.localCombats.length} total)</div>
          {combats.localCombats.map((e) => (
            <div key={e.id}>
              start-{e.startTime} zone-{e.startInfo.zoneId} bracket-{e.startInfo.bracket} result-{e.result}
            </div>
          ))}
        </div>
        <div className="flex flex-col">
          <div>User: {JSON.stringify(auth.user)}</div>
          <Button
            onClick={() => {
              auth.signIn();
            }}
          >
            Sign In
          </Button>
          <Button
            onClick={() => {
              auth.signOut();
            }}
          >
            Sign Out
          </Button>
        </div>
        <div className="flex flex-col">
          <Button
            onClick={() => {
              window.wowarenalogs.links?.openExternalURL('https://worldofwarcraft.com/en-us/');
            }}
          >
            Test Open External URL
          </Button>
          <Button
            onClick={() => {
              window.wowarenalogs.fs?.folderSelected((_event, folder) =>
                client.updateAppConfig((prev) => {
                  return { ...prev, wowDirectory: folder };
                }),
              );
              window.wowarenalogs.fs?.selectFolder({
                'setup-page-locate-wow-mac': '',
                'setup-page-locate-wow-windows': '',
                'setup-page-invalid-location': '',
                'setup-page-invalid-location-message': '',
                confirm: 'confirm-message',
              });
            }}
          >
            Select WoW Folder (installs addon, starts loggers)
          </Button>
          <Button
            onClick={() => {
              client.updateAppConfig((prev) => {
                return { ...prev, wowDirectory: undefined };
              });
            }}
          >
            Clear WoW Folder Setting
          </Button>
          <Button
            onClick={() => {
              client.saveWindowPosition();
            }}
          >
            Save Window Pos
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Debug;
