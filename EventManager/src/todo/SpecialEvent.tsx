import React, { useEffect, useState } from 'react';
import { createAnimation, IonItem, IonLabel, IonModal } from "@ionic/react";
import { SpecialEventProps } from './SpecialEventProps';

interface SpecialEventPropsExt extends SpecialEventProps {
  onEdit: (_id?: string) => void;
}

const SpecialEvent: React.FC<SpecialEventPropsExt> = ({ _id, title,webViewPath, onEdit }) => {
  const [showModal, setShowModal] = useState(false);

  const enterAnimation = (baseEl: any) => {

      const backdropAnimation = createAnimation()
          .addElement(baseEl.querySelector('ion-backdrop')!)
          .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');
  
      const wrapperAnimation = createAnimation()
          .addElement(baseEl.querySelector('.modal-wrapper')!)
          .keyframes([
              { offset: 0, opacity: '0', transform: 'scale(0)' },
              { offset: 1, opacity: '0.99', transform: 'scale(1)' }
          ]);
  
      return createAnimation()
          .addElement(baseEl)
          .easing('ease-out')
          .duration(500)
          .addAnimation([backdropAnimation, wrapperAnimation]);
  }
  
  const leaveAnimation = (baseEl: any) => {
      return enterAnimation(baseEl).direction('reverse');
  }

  return (
    <IonItem>
      <IonLabel onClick={() => onEdit(_id)}>{title}</IonLabel>
      {webViewPath && (<img id="image" src={webViewPath} width={'200px'} height={'200px'} onClick={() => {
                setShowModal(true);
            }} />)}

      {!webViewPath && (<img src={'https://static.thenounproject.com/png/3322766-200.png'} width={'200px'} height={'200px'} />)}


            <IonModal isOpen={showModal} enterAnimation={enterAnimation} leaveAnimation={leaveAnimation} backdropDismiss={true} onDidDismiss={() => setShowModal(false)}>
                <img id="image" src={webViewPath} />
            </IonModal>
    </IonItem>
  );
};

export default SpecialEvent;
