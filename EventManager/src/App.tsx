// import React from 'react';
// import { Redirect, Route } from 'react-router-dom';
// import { IonApp, IonRouterOutlet } from '@ionic/react';
// import { IonReactRouter } from '@ionic/react-router';
// import { SpecialEventsList, SpecialEventEdit } from './todo';

// /* Core CSS required for Ionic components to work properly */
// import '@ionic/react/css/core.css';

// /* Basic CSS for apps built with Ionic */
// import '@ionic/react/css/normalize.css';
// import '@ionic/react/css/structure.css';
// import '@ionic/react/css/typography.css';

// /* Optional CSS utils that can be commented out */
// import '@ionic/react/css/padding.css';
// import '@ionic/react/css/float-elements.css';
// import '@ionic/react/css/text-alignment.css';
// import '@ionic/react/css/text-transformation.css';
// import '@ionic/react/css/flex-utils.css';
// import '@ionic/react/css/display.css';

// /* Theme variables */
// import './theme/variables.css';
// import { SpecialEventProvider } from './todo/SpecialEventProvider';

// const App: React.FC = () => (
//   <IonApp>
//     <SpecialEventProvider>
//       <IonReactRouter>
//         <IonRouterOutlet>
//           <Route path="/items" component={SpecialEventsList} exact={true} />
//           <Route path="/item" component={SpecialEventEdit} exact={true} />
//           <Route path="/item/:id" component={SpecialEventEdit} exact={true} />
//           <Route exact path="/" render={() => <Redirect to="/items" />} />
//         </IonRouterOutlet>
//       </IonReactRouter>
//     </SpecialEventProvider>
//   </IonApp>
// );

// export default App;

import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { SpecialEventEdit, SpecialEventsList } from './todo';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import { SpecialEventProvider } from './todo/SpecialEventProvider';
import { AuthProvider, Login, PrivateRoute } from './authentification';

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <AuthProvider>
          <Route path="/login" component={Login} exact={true}/>
          <SpecialEventProvider>
            <PrivateRoute path="/items" component={SpecialEventsList} exact={true}/>
            <PrivateRoute path="/item" component={SpecialEventEdit} exact={true}/>
            <PrivateRoute path="/item/:id" component={SpecialEventEdit} exact={true}/>
          </SpecialEventProvider>
          <Route exact path="/" render={() => <Redirect to="/items"/>}/>
        </AuthProvider>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;

