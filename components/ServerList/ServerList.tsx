import { useChatContext } from 'stream-chat-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { DiscordServer } from '@/app/page';
import { useDiscordContext } from '@/contexts/DiscordContext';
import CreateServerForm from './CreateServerForm';
import Link from 'next/link';
import { Channel } from 'stream-chat';

const ServerList = () => {
  console.log('[ServerList]');
  const { client } = useChatContext();
  const { server: activeServer, changeServer } = useDiscordContext();
  const [serverList, setServerList] = useState<DiscordServer[]>([]);

  const loadServerList = useCallback(async (): Promise<void> => {
    const channels = await client.queryChannels({});
    const serverSet: Set<DiscordServer> = new Set(
      channels
        .map((channel: Channel) => {
          return {
            name: (channel.data?.data?.server as string) ?? 'Unknown',
            image: channel.data?.data?.image,
          };
        })
        .filter((server: DiscordServer) => server.name !== 'Unknown')
    );
    const serverArray = Array.from(serverSet.values());
    setServerList(serverArray);
    if (serverArray.length > 0) {
      changeServer(serverArray[0], client);
    }
  }, [client, changeServer]);

  useEffect(() => {
    loadServerList();
  }, [loadServerList]);

  return (
    <div className='bg-gray-200 h-full flex flex-col items-center'>
      <button
        className={`block p-3 aspect-square sidebar-icon ${
          activeServer === undefined ? 'selected-icon' : ''
        }`}
        onClick={() => changeServer(undefined, client)}
      >
        <div className='rounded-icon discord-icon'></div>
      </button>
      <div className='border-t-2 border-t-gray-300'>
        {serverList.map((server) => {
          return (
            <button
              key={server.name}
              className={`p-4 sidebar-icon ${
                server === activeServer ? 'selected-icon' : ''
              }`}
              onClick={() => {
                changeServer(server, client);
              }}
            >
              {server.image ? (
                <Image
                  className='rounded-icon'
                  src={server.image}
                  width={50}
                  height={50}
                  alt='Server Icon'
                />
              ) : (
                <span className='text-sm'>{server.name.charAt(0)}</span>
              )}
            </button>
          );
        })}
      </div>
      <Link
        href={'/?createServer=true'}
        className='flex items-center justify-center rounded-icon bg-white text-green-500 hover:bg-green-500 hover:text-white hover:rounded-xl transition-all duration-200 p-2 my-2 text-2xl font-light h-12 w-12'
      >
        <span className='inline-block'>+</span>
      </Link>
      <CreateServerForm />
    </div>
  );
};

export default ServerList;