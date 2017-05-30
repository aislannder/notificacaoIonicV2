import {Component, ViewChild} from "@angular/core";
import {AlertController, Nav, Platform} from "ionic-angular";
import {StatusBar} from "@ionic-native/status-bar";
import {SplashScreen} from "@ionic-native/splash-screen";
import {Push, PushObject, PushOptions} from "@ionic-native/push";
import {TabsPage} from "../pages/tabs/tabs";
import {DetailsPage} from "../pages/details/details";

@Component({
  template: '<ion-nav [root]="rootPage"></ion-nav>'
})
export class Ionic2PushApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any;

  constructor(public platform: Platform,
              public statusBar: StatusBar,
              public splashScreen: SplashScreen,
              public push: Push,
              public alertCtrl: AlertController) {
    this.rootPage = TabsPage;
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.initPushNotification();
    });
  }

  initPushNotification() {
    if (!this.platform.is('cordova')) {
      alert("Notificações de envio não inicializadas. Cordova não está disponível - Executar em dispositivo físico");
      return;
    }
    const options: PushOptions = {
      android: {
        senderID: "896514799547",
        icon: 'icon',
        sound: true,
        vibrate: true,
        forceShow: true
      },
      ios: {},
      windows: {}
    };
    const pushObject: PushObject = this.push.init(options);

    pushObject.on('registration').subscribe((data: any) => {
      console.log("Token do dispositivo :: " + data.registrationId);

      localStorage.setItem('device_token', data.registrationId);
      //this.device_token = localStorage.getItem('device_token');

        let alert = this.alertCtrl.create({
          title: 'Token do dispositivo',
          subTitle: data.registrationId,
          buttons: ['OK']
        });

        alert.present();

      //TODO - Enviar token de dispositivo para servidor
    });

    pushObject.on('notification').subscribe((data: any) => {
      console.log('message', data.message);
      //if user using app and push notification comes
      if (data.additionalData.foreground) {
        // if application open, show popup
        let confirmAlert = this.alertCtrl.create({
          title: 'Nova Notificação',
          message: data.message,
          buttons: [{
            text: 'Ignore',
            role: 'cancel'
          }, {
            text: 'View',
            handler: () => {
              //TODO: Your logic here
              this.nav.push(DetailsPage, {message: data.message});
            }
          }]
        });
        confirmAlert.present();
      } else {
        //if user NOT using app and push notification comes
        //TODO: Your logic on click of push notification directly
        this.nav.push(DetailsPage, {message: data.message});
        console.log("Push notification clicked");
      }
    });

    pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));
  }
}

