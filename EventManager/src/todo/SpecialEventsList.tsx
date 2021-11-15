import React, { useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import {
  IonCard,
  IonChip,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonList, IonListHeader, IonLoading,
  IonPage,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToast,
  IonToolbar
} from '@ionic/react';
import { add } from 'ionicons/icons';
import SpecialEvent from './SpecialEvent';
import { getLogger } from '../core';
import { SpecialEventContext } from './SpecialEventProvider';
import { SpecialEventProps } from './SpecialEventProps';
import { AuthContext } from '../authentification';
import {Network} from '@capacitor/core';

const offset = 4;

const log = getLogger('ItemList');

const SpecialEventsList: React.FC<RouteComponentProps> = ({ history }) => {
  const { items, fetching, fetchingError, savedOffline, setSavedOffline } = useContext(SpecialEventContext);
  const { logout } = useContext(AuthContext);
  const [disableInfiniteScroll, setDisabledInfiniteScroll] = useState<boolean>(false);
  const [visibleItems, setVisibleItems] = useState<SpecialEventProps[] | undefined>([]);
  const [totalVisibleItems, setTotalVisibleItems] = useState<number>(0)
  const [filter, setFilter] = useState<boolean | undefined>(undefined);
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<boolean>(true);

  Network.getStatus().then(status => setStatus(status.connected));

  Network.addListener('networkStatusChange', (status) => {
      setStatus(status.connected);
  })

  useEffect(() => {
    if (items?.length == 0)
    {
      setVisibleItems([]);
      setTotalVisibleItems(0);
      return;
    }
    if (items?.length && items?.length > 0) {
        setTotalVisibleItems(0);
        setVisibleItems([]);
        fetchData();
    }
  }, [items]);

  useEffect(() => {
    if (items && filter !== undefined) {
        setVisibleItems(items.filter(each => each.isApproved === filter));
    }
  }, [filter]);

  useEffect(() => {
    if (search === "") {
        setVisibleItems(items);
    }
    if (items && search !== "") {
        setVisibleItems(items.filter(each => each.title.startsWith(search)));
    }
  }, [search])

  function fetchData() {
    if (items && totalVisibleItems + offset > items?.length)
    {
      setVisibleItems(items?.slice(0, items.length));
      setTotalVisibleItems(items.length);
      setDisabledInfiniteScroll(true);
    }
    else
    {
      setVisibleItems(items?.slice(0, totalVisibleItems + offset));
      setTotalVisibleItems(totalVisibleItems + offset);
    }
  }

  async function searchNext($event: CustomEvent<void>) {
    fetchData();
    ($event.target as HTMLIonInfiniteScrollElement).complete();
  }

return (
  <IonPage>
      <IonHeader>
          <IonToolbar>
              <IonItem>
                  <IonSelect style={{ width: '40%' }} value={filter} placeholder="Choose if event is approved or not" onIonChange={(e) => setFilter(e.detail.value)}>
                     < IonSelectOption value={true}>
                        Approved
                      </IonSelectOption>
                      < IonSelectOption value={false}>
                        Not approved
                      </IonSelectOption>
                  </IonSelect>
                  <IonSearchbar style={{ width: '50%' }} placeholder="Search by title" value={search} debounce={200} onIonChange={(e) => {
                      setSearch(e.detail.value!);
                  }}>
                  </IonSearchbar>
                  <IonChip>
                  <IonLabel color={status? "success" : "danger"}>{status? "Online" : "Offline"}</IonLabel>
              </IonChip>
              </IonItem>
              
          </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonList>
          {
            visibleItems &&
                visibleItems.map(({_id, title, numberOfPeople, date, isApproved}) =>
                <IonCard key={_id}> 
                    <SpecialEvent
                          key={_id}
                          _id={_id}
                          title={title}
                          numberOfPeople={numberOfPeople}
                          date={date}
                          isApproved={isApproved}
                          onEdit={_id => history.push(`/item/${_id}`)}
                      />
                      <img src={"https://www.specialevents.com/sites/all/themes/penton_subtheme_specialevents/images/logos/header.png"}></img>
                    </IonCard>
                    )
            }
            </IonList>
          <IonInfiniteScroll threshold="100px" disabled={disableInfiniteScroll} onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
              <IonInfiniteScrollContent loadingText="Loading...">
              </IonInfiniteScrollContent>
          </IonInfiniteScroll>

          {
              fetchingError && (
              <div>{fetchingError.message || 'Failed to fetch items'}</div>
              )
          }

          <IonFab vertical="bottom" horizontal="end" slot="fixed">
              <IonFabButton onClick={() => history.push('/item')}>
                  <IonIcon icon={add}/>
              </IonFabButton>
          </IonFab>

          <IonFab vertical="bottom" horizontal="start" slot="fixed">
              <IonFabButton onClick={handleLogout}>
                  LOGOUT
              </IonFabButton>
          </IonFab>
          {savedOffline && 
          <div color="blue">
            Currently offline, your changes will be saved
          </div>
          }
      </IonContent>
  </IonPage>
);

function handleLogout() {
  log("logout");
  logout?.();
}
};

export default SpecialEventsList;
