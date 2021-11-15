import React, { useCallback, useContext, useEffect, useReducer, useState } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { SpecialEventProps } from './SpecialEventProps';
import { createItem, getItems, newWebSocket, updateItem, handleOfflineData } from './SpecialEventApi';
import { AuthContext } from '../authentification';
import { Plugins } from "@capacitor/core";

const log = getLogger('ItemProvider');
const { Storage } = Plugins;
const {Network} = Plugins;

const RANDOM_ID_LENGTH = 10;


type SaveItemFn = (item: SpecialEventProps) => Promise<any>;

export interface ItemsState {
  items?: SpecialEventProps[],
  fetching: boolean,
  fetchingError?: Error | null,
  saving: boolean,
  savingError?: Error | null,
  saveItem?: SaveItemFn,
  connectedNetwork?: boolean,
  setSavedOffline?: Function,
  savedOffline?: boolean
}

interface ActionProps {
  type: string,
  payload?: any,
}

const initialState: ItemsState = {
  fetching: false,
  saving: false,
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
const SAVE_ITEM_STARTED = 'SAVE_ITEM_STARTED';
const SAVE_ITEM_SUCCEEDED = 'SAVE_ITEM_SUCCEEDED';
const SAVE_ITEM_FAILED = 'SAVE_ITEM_FAILED';

const reducer: (state: ItemsState, action: ActionProps) => ItemsState =
  (state, { type, payload }) => {
    switch (type) {
      case FETCH_ITEMS_STARTED:
        return { ...state, fetching: true, fetchingError: null };
      case FETCH_ITEMS_SUCCEEDED:
        return { ...state, items: payload.items, fetching: false };
      case FETCH_ITEMS_FAILED:
        return { ...state, fetchingError: payload.error, fetching: false };
      case SAVE_ITEM_STARTED:
        return { ...state, savingError: null, saving: true };
      case SAVE_ITEM_SUCCEEDED:
        const items = [...(state.items || [])];
        const item = payload.item;
        if (item._id === undefined)
          return state;
        const index = items.findIndex(it => it._id === item._id);
        if (index === -1) {
          items.splice(0, 0, item);
        } else {
          items[index] = item;
        }
        return { ...state, items, saving: false };
      case SAVE_ITEM_FAILED:
        return { ...state, savingError: payload.error, saving: false };
      default:
        return state;
    }
  };

export const SpecialEventContext = React.createContext<ItemsState>(initialState);

interface SpecialEventProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const SpecialEventProvider: React.FC<SpecialEventProviderProps> = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { items, fetching, fetchingError, saving, savingError } = state;
  const [connectedNetworkStatus, setConnectedNetworkStatus] = useState<boolean>(false);
  const [savedOffline, setSavedOffline] = useState<boolean>(false);

  useEffect(getItemsEffect, [token]);
  useEffect(wsEffect, [token]);
  useEffect(networkEffect, [token, setConnectedNetworkStatus]);

  
  const saveItem = useCallback<SaveItemFn>(saveItemCallback, [token]);

  const value = { items, fetching, fetchingError, saving, savingError, saveItem, connectedNetworkStatus, savedOffline, setSavedOffline};

  log('returns');

  return (
    <SpecialEventContext.Provider value={value}>
      {children}
    </SpecialEventContext.Provider>
  );

  function getItemsEffect() {
    let canceled = false;
    fetchItems();
    return () => {
      canceled = true;
    }

    async function fetchItems() {
    //   if (!token?.trim()) {
    //     return;
    //   }
    //   try {
    //     log('fetchItems started');
    //     dispatch({ type: FETCH_ITEMS_STARTED });
    //     const items = await getItems(token);
    //     log('fetchItems succeeded');
    //     if (!canceled) {
    //       dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { items } });
    //     }
    //   } catch (error) {
    //     log('fetchItems failed');
    //     dispatch({ type: FETCH_ITEMS_FAILED, payload: { error } });
    //   }
    // }

    if (!token?.trim()) {
      return;
    }

    if (!navigator?.onLine) {
        let storageKeys = Storage.keys();
        const specialEvents = await storageKeys.then(async function (storageKeys) {
            const saved = [];
            for (let i = 0; i < storageKeys.keys.length; i++) {
                if (storageKeys.keys[i] !== "token") {
                    const specialEvent = await Storage.get({key : storageKeys.keys[i]});
                    if (specialEvent.value != null) {
                        var parsedSpecialEvent = JSON.parse(specialEvent.value);
                        saved.push(parsedSpecialEvent);
                    }
                }
            }

            return saved;
        });
        dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {items: specialEvents}});
    } else {
        try {
            log('fetchSpecialEvents started');

            dispatch({type: FETCH_ITEMS_STARTED});
            const items = await getItems(token);

            log('fetchSpecialEvents successful');

            if (!canceled) {
                dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {items: items}})
            }
        } catch (error) {
            let storageKeys = Storage.keys();
            const specialEvents = await storageKeys.then(async function (storageKeys) {
                const saved = [];
                for (let i = 0; i < storageKeys.keys.length; i++) {
                    if (storageKeys.keys[i] !== "token") {
                        const specialEvent = await Storage.get({key : storageKeys.keys[i]});
                        if (specialEvent.value != null)
                        {
                            var parsedSpecialEvent = JSON.parse(specialEvent.value);
                            saved.push(parsedSpecialEvent);
                        }
                    }
                }

                return saved;
            });
            dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {items: specialEvents}});
        }
      }
    }
  }

  // async function saveItemCallback(item: SpecialEventProps) {
  //   try {
  //     log('saveItem started');
  //     dispatch({ type: SAVE_ITEM_STARTED });
  //     const savedItem = await (item._id ? updateItem(token, item) : createItem(token, item));
  //     log('saveItem succeeded');
  //     dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item: savedItem } });
  //   } catch (error) {
  //     log('saveItem failed');
  //     dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
  //   }
  // }

  function getRandomId(): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( var i = 0; i < RANDOM_ID_LENGTH; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return "id"+result;
  }

  async function saveItemCallback(item: SpecialEventProps) {
    try {
        if (navigator.onLine) {
            log('saveSpecialEvent started');

            dispatch({ type: SAVE_ITEM_STARTED });
            const updatedItem = await (item._id ? updateItem(token, item) : createItem(token, item))

            log('saveSpecialEvent successful');
            dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {item: updatedItem}});
          }
          
          else {
            log('saveSpecialEvent offline');
            item._id = (item._id === undefined) ? getRandomId() : item._id;

            await Storage.set({
                  key: item._id!,
                  value: JSON.stringify({
                  _id: item._id,
                  title: item.title,
                  numberOfPeople: item.numberOfPeople,
                  date: item.date,
                  isApproved: item.isApproved
                  })
            });

            dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {item : item}});
            setSavedOffline(true);
          }
      }
      catch(error) {
          log('saveSpecialEvent failed');
          
          await Storage.set({
              key: String(item._id),
              value: JSON.stringify(item)
          })
          dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {item : item}});
      }
  }

  function wsEffect() {
    let canceled = false;
    log('wsEffect - connecting');
    let closeWebSocket: () => void;
    if (token?.trim()) {
      closeWebSocket = newWebSocket(token, message => {
        if (canceled) {
          return;
        }
        const { type, payload: item } = message;
        log(`ws message, item ${type}`);
        if (type === 'created' || type === 'updated') {
          dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item } });
        }
      });
    }
    return () => {
      log('wsEffect - disconnecting');
      canceled = true;
      closeWebSocket?.();
    }
  }

  function networkEffect() {
    console.log("network effect");
    let canceled = false;
    Network.addListener('networkStatusChange', async (status) => {
        if (canceled) return;
        const connected = status.connected;
        if (connected) {
            console.log("networkEffect - handle offline data");
            await handleOfflineData(token);
        }
        setConnectedNetworkStatus(status.connected);
    });
    return () => {
        canceled = true;
    }
  }
};
