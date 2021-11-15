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

const log = getLogger('ItemEdit');

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
    }
  }, [match.params.id, items]);

  const handleSave = () => {
    const editedItem = item ? { ...item, title, isApproved, numberOfPeople, date } : { title, isApproved, numberOfPeople, date };
    saveItem && saveItem(editedItem).then(() => history.goBack());
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
          <IonLoading isOpen={saving}/>
            {savingError && (
                <div>{savingError?.message || 'Failed to save book'}</div>
            )}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default SpecialEventEdit;
