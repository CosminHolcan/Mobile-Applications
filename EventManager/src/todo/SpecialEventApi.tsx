import axios from 'axios';
import { authConfig, baseUrl, getLogger, withLogs } from '../core';
import { SpecialEventProps } from './SpecialEventProps';
import { Plugins} from '@capacitor/core';

const log = getLogger('itemApi');
const { Storage } = Plugins;

const itemUrl = `http://${baseUrl}/api/specialEvent`;

interface MessageData {
  type: string;
  payload: SpecialEventProps;
}

const different = (specialEvent1: SpecialEventProps, specialEvent2: SpecialEventProps) => {
  if (specialEvent1.title !== specialEvent2.title || specialEvent1.numberOfPeople !== specialEvent2.numberOfPeople ||
      specialEvent1.date !== specialEvent2.date || specialEvent1.isApproved !== specialEvent2.isApproved)

    return true;

  return false;
}

export const handleOfflineData: (token: string) => Promise<SpecialEventProps[]> = async token => {
  try {
    const { keys } = await Storage.keys();
    var result = axios.get(itemUrl, authConfig(token));
    result.then(async result => {
      keys.forEach(async i => {
        if (i !== 'token') {
          const storageSpecialEvent = await Storage.get({key: i});
          const serverSpecialEvent = result.data.find((each: { _id: string; }) => each._id === i);

          console.log('STORAGE VERSION OF SPECIAL EVENT : ' + storageSpecialEvent.value!);
          console.log('SERVER VERSION OF SPECIAL EVENT : ' + JSON.stringify(serverSpecialEvent));

          if (serverSpecialEvent !== undefined && different(serverSpecialEvent, JSON.parse(storageSpecialEvent.value!))) {
            console.log('UPDATE ' + storageSpecialEvent.value);
            axios.put(`${itemUrl}/${i}`, JSON.parse(storageSpecialEvent.value!), authConfig(token));
          } else if (serverSpecialEvent === undefined) {
            console.log('CREATE ' + storageSpecialEvent.value!);
            axios.post(itemUrl, JSON.parse(storageSpecialEvent.value!), authConfig(token));
          }
        }
        })
    }).catch(err => {
      console.log(err);
  })
    return withLogs(result, 'handleOfflineData');
  } catch (error) {
    throw error;
  }    
}

// export const getItems: (token: string) => Promise<SpecialEventProps[]> = token => {
//   return withLogs(axios.get(itemUrl, authConfig(token)), 'getItems');
// }

export const getItems: (token: string) => Promise<SpecialEventProps[]> = token => {  
  try {
    var result = axios.get(itemUrl, authConfig(token));
    result.then(async result => {
      for (const specialEvent of result.data) {
          await Storage.set({
            key: specialEvent._id!,
            value: JSON.stringify({
              _id: specialEvent._id,
              title: specialEvent.title,
              numberOfPeople: specialEvent.numberOfPeople,
              date: specialEvent.date,
              isApproved: specialEvent.isApproved
            })
          });
      }
    }).catch(err => {
      console.log(err);
  })
    return withLogs(result, 'getItems');
  } catch (error) {
    throw error;
  }    
}

// export const createItem: (token: string, item: SpecialEventProps) => Promise<SpecialEventProps[]> = (token,item) => {
//   return withLogs(axios.post(itemUrl, item, authConfig(token)), 'createItem');
// }

export const createItem: (token: string, specialEvent: SpecialEventProps) => Promise<SpecialEventProps[]> = (token, specialEvent) => {
  var result = axios.post(itemUrl, specialEvent, authConfig(token));
  result.then(async result => {
    var specialEventData = result.data;
    await Storage.set({
      key: specialEventData._id!,
      value: JSON.stringify({
        _id: specialEventData._id,
        title: specialEventData.title,
        numberOfPeople: specialEventData.numberOfPeople,
        date: specialEventData.date,
        isApproved: specialEventData.isApproved
        })
    });
  }).catch(err => {
    console.log(err);
});
  return withLogs(result, 'createItem');
}

// export const updateItem: (token: string, item: SpecialEventProps) => Promise<SpecialEventProps[]> = (token,item) => {
//   return withLogs(axios.put(`${itemUrl}/${item._id}`, item, authConfig(token)), 'updateItem');
// }

export const updateItem: (token: string, specialEvent: SpecialEventProps) => Promise<SpecialEventProps[]> = (token, specialEvent) => {
  var result = axios.put(`${itemUrl}/${specialEvent._id}`, specialEvent, authConfig(token));
  result.then(async result => {
    var specialEventData = result.data;
    await Storage.set({
      key: specialEventData._id!,
      value: JSON.stringify({
        _id: specialEventData._id,
        title: specialEventData.title,
        numberOfPeople: specialEventData.numberOfPeople,
        date: specialEventData.date,
        isApproved: specialEventData.isApproved
        })
    }).catch(err => {
      if (err.response) {
        console.log(err);
      }
  })
  });
  return withLogs(result, 'updateItem');
}

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
  const ws = new WebSocket(`ws://${baseUrl}`);
  ws.onopen = () => {
    log('web socket onopen');
    ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
  };
  ws.onclose = () => {
    log('web socket onclose');
  };
  ws.onerror = error => {
    log('web socket onerror', error);
  };
  ws.onmessage = messageEvent => {
    log('web socket onmessage');
    onMessage(JSON.parse(messageEvent.data));
  };
  return () => {
    ws.close();
  }
}
