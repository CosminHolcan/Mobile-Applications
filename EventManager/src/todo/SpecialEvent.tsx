import React from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import { SpecialEventProps } from './SpecialEventProps';

interface SpecialEventPropsExt extends SpecialEventProps {
  onEdit: (id?: string) => void;
}

const SpecialEvent: React.FC<SpecialEventPropsExt> = ({ id, title, onEdit }) => {
  return (
    <IonItem onClick={() => onEdit(id)}>
      <IonLabel>{title}</IonLabel>
    </IonItem>
  );
};

export default SpecialEvent;
