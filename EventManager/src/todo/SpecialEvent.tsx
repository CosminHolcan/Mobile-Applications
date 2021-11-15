import React from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import { SpecialEventProps } from './SpecialEventProps';

interface SpecialEventPropsExt extends SpecialEventProps {
  onEdit: (_id?: string) => void;
}

const SpecialEvent: React.FC<SpecialEventPropsExt> = ({ _id, title, onEdit }) => {
  return (
    <IonItem onClick={() => onEdit(_id)}>
      <IonLabel>{title}</IonLabel>
    </IonItem>
  );
};

export default SpecialEvent;
