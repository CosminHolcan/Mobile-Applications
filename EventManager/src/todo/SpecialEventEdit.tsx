import React, { useContext, useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar,
  IonToggle,
  IonDatetime, 
  IonRange,
  IonLabel,
  IonList,
  IonItem
} from '@ionic/react';
import { getLogger } from '../core';
import { SpecialEventContext } from './SpecialEventProvider';
import { RouteComponentProps } from 'react-router';
import { SpecialEventProps } from './SpecialEventProps';
import { useMyLocation } from '../core/useMyLocation';
import { usePhotoGallery } from '../core/usePhotoGallery';
import { MyMap } from '../core/MyMap';

interface SpecialEventEditProps extends RouteComponentProps<{
  id?: string;
}> {}

const SpecialEventEdit: React.FC<SpecialEventEditProps> = ({ history, match }) => {
  const { items, saving, savingError, saveItem } = useContext(SpecialEventContext);
  const [title, setTitle] = useState('');
  const [numberOfPeople, setNumberPeople] = useState<number>(0);
  const [date, setDate] = useState<Date>(new Date());
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [item, setItem] = useState<SpecialEventProps>();

  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [currentLatitude, setCurrentLatitude] = useState<number | undefined>(undefined);
  const [currentLongitude, setCurrentLongitude] = useState<number | undefined>(undefined);
  const [webViewPath, setWebViewPath] = useState('');

  const location = useMyLocation();
  const {latitude : currentLocationLatitude, longitude : currentLocationLongitude} = location.position?.coords || {};

  const {takePhoto} = usePhotoGallery();

  useEffect(() => {
    log('useEffect');
    const routeId = match.params.id || '';
    console.log(items);
    const item = items?.find(it => it._id === routeId);
    setItem(item);
    if (item) {
      setTitle(item.title);
      setNumberPeople(item.numberOfPeople);
      setIsApproved(item.isApproved);
      setDate(item.date);
      setLatitude(item.latitude);
      setLongitude(item.longitude);
      setWebViewPath(item.webViewPath);
    }
  }, [match.params.id, items]);

  useEffect(() => {
    if (latitude === undefined && longitude === undefined) {
        setCurrentLatitude(currentLocationLatitude);
        setCurrentLongitude(currentLocationLongitude);
    } else {
        setCurrentLatitude(latitude);
        setCurrentLongitude(longitude);
    }
}, [currentLocationLatitude, currentLocationLongitude, longitude, latitude]);

  const handleSave = () => {
    const editedItem = item ? { ...item, title, isApproved, numberOfPeople, date, latitude, longitude, webViewPath } : { title, isApproved, numberOfPeople, date, latitude, longitude, webViewPath };
    saveItem && saveItem(editedItem).then(() => history.goBack());
  };

  async function handlePhotoChange() {
    const image = await takePhoto();
    if (!image) {
        setWebViewPath('');
    } else {
        setWebViewPath(image);
    }
  };

  function setLocation() {
      setLatitude(currentLatitude);
      setLongitude(currentLongitude);
  };

  log('render');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Create/Edit</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSave}>
              Save
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem>
          <IonLabel >Title of event</IonLabel>
          <IonInput value={title} onIonChange={e => setTitle(e.detail.value || '')} />
          </IonItem>
          <IonItem>
            <IonLabel>Is approved</IonLabel>
            <IonToggle checked={isApproved} onIonChange={e => setIsApproved(e.detail.checked)} />
          </IonItem>
          <IonItem>
            <IonLabel>Date</IonLabel>
            <IonDatetime min="2021" max="2025" value={date.toString()} onIonChange={e => {if (e.detail.value) setDate(new Date(e.detail.value?.toString()))} }/>
          </IonItem>
          <IonItem>
            <IonLabel>Number of people</IonLabel>
            <IonRange min={50} max={2000} pin={true} value={numberOfPeople} onIonChange={e => setNumberPeople(e.detail.value as number)} />
          </IonItem>
          <IonItem>
                <IonLabel>Show us where the event will take place!</IonLabel>
                <IonButton onClick={setLocation}>Set location</IonButton>
            </IonItem>

          {webViewPath && (<img onClick={handlePhotoChange} src={webViewPath} width={'200px'} height={'200px'}/>)}
          {!webViewPath && (<img onClick={handlePhotoChange} src={'https://static.thenounproject.com/png/3322766-200.png'} width={'200px'} height={'200px'}/>)}

          {currentLocationLatitude && currentLocationLongitude &&
                <MyMap
                   lat={currentLatitude}
                   lng={currentLongitude}
                   onMapClick={log('onMap')}
                   onMarkerClick={log('onMarker')}
                />
            }

          <IonLoading isOpen={saving}/>
            {savingError && (
                <div>{savingError?.message || 'Failed to save special event'}</div>
            )}
        </IonList>
      </IonContent>
    </IonPage>
  );

  function log(source: string) {
    return (e: any) => {
    setCurrentLatitude(e.latLng.lat());
    setCurrentLongitude(e.latLng.lng());
    console.log(source, e.latLng.lat(), e.latLng.lng());
    }
  
  }
};

export default SpecialEventEdit;
