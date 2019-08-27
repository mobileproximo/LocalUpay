import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ServiceService } from 'src/app/services/service.service';
import { Storage } from '@ionic/storage';
import { GlobalVariableService } from 'src/app/services/global-variable.service';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
declare var SMSReceive: any;
@Component({
  selector: 'app-souscription-suite',
  templateUrl: './souscription-suite.page.html',
  styleUrls: ['./souscription-suite.page.scss'],
})
export class SouscriptionSuitePage implements OnInit {
  commingData: any;
  Userdata: FormGroup;
  public isconform = false;
  message: string;
  constructor(public navCtrl: NavController,
              private router: Router,
              public formBuilder: FormBuilder,
              private storage: Storage,
              public platform: Platform,
              public glb: GlobalVariableService,
              public androidPermissions: AndroidPermissions,
              public serv: ServiceService) {
    this.commingData = this.router.getCurrentNavigation().extras.state.user;
    this.Userdata = this.formBuilder.group({
      login: ['', Validators.required],
      codeotp: ['', Validators.required],
      codepin: ['', Validators.required],
      confpin: ['', Validators.required],
      prenom: [''],
      nom: [''],
      numpiece: ['', Validators.required],
      email: [''],
      mode: ['']
    });
    
  }
  ionViewDidLeave() {
   this.stopwatching();
  }
  smsreceiver() {
    this.platform.ready().then(() => {
      if (SMSReceive) {
      this.startWatching();
      document.addEventListener('onSMSArrive', (e: any) => {
        const IncomingSMS = e.data;
        const message = IncomingSMS.body;
        this.Userdata.controls.codeotp.setValue(message.substring(message.length - 4));
  
    });
      } else {
        this.serv.showError('Impossible de lire un sms entrant');
        alert('nok');
      }
    });
  }



  stopwatching() {
    SMSReceive.stopWatch(
      () => { console.log('watch stopped'); },
      () => { console.log('watch stop failed'); }
    );
  }

  startWatching() {
    SMSReceive.startWatch(
      () => { console.log('watch started'); },
      () => { console.log('watch started failed'); }
    );
  }

  restartWatching() {
    SMSReceive.stopWatch(
      () => {
        this.startWatching();
        console.log('watch stopped');
      },
      () => { console.log('watch stop failed'); }
    );
  }

  ngOnInit() {
    this.Userdata.controls.login.setValue(this.commingData.login);
    this.Userdata.controls.prenom.setValue(this.commingData.prenom);
    this.Userdata.controls.nom.setValue(this.commingData.nom);
    this.Userdata.controls.numpiece.setValue(this.commingData.numpiece);
    this.Userdata.controls.email.setValue(this.commingData.email);
    this.Userdata.controls.mode.setValue(this.commingData.mode);
    console.log(JSON.stringify(this.Userdata.getRawValue()));
    this.smsreceiver();
  }
  verifConfPin() {

    // console.log('pin ' + codepin)
    // console.log('confpin ' + confpin)
    if (this.Userdata.controls.codepin.value > 4) {
      const val = this.Userdata.controls.codepin.value.toString();
      this.Userdata.controls.codepin.setValue(val.substring(0, 4));
    }
    if (this.Userdata.controls.confpin.value > 4) {
      const val = this.Userdata.controls.confpin.value.toString();
      this.Userdata.controls.confpin.setValue(val.substring(0, 4));
    }
    const codepin = this.Userdata.controls.codepin.value;
    const confpin = this.Userdata.controls.confpin.value;
    if (isNaN(codepin)) {
      this.isconform = false;
      this.message = 'Le code pin doit etre composé  uniquement des chiffres';
    } else {
      if (this.serv.CheckIfSequence(codepin)) {
        this.isconform = false;
        this.message = 'Le code ne doit pas être consecutif ni composé d\'un même chiffre';
      } else {
        console.log('Mes pin sont pin1: ' + codepin + ' pin2: ' + confpin);
        this.isconform = codepin === confpin;
        if (!this.isconform) {
          this.message = 'Les codes pin saisis ne sont pas conformes';
        }
      }
    }
  }
  verssouscription() {
    // this.navCtrl.navigateBack('utilisateur');
    this.navCtrl.back();
  }
  versbienvenue() {
    this.navCtrl.navigateForward('utilisateur/bienvenue');
  }
  souscription() {
    const userdata = this.Userdata.getRawValue();
    userdata.codeOTP = userdata.codeotp;
    this.serv.afficheloading();
    this.serv.posts('connexion/checkOTP.php', userdata, {}).then(data => {
      const reponse = JSON.parse(data.data);
      if (reponse.returnCode) {
        if (reponse.returnCode === '0') {
          this.serv.posts('connexion/souscription.php', userdata, {}).then(rep => {
            this.serv.dismissloadin();
            const souscription = JSON.parse(rep.data);

            if (souscription.returnCode) {
              if (souscription.returnCode === '0') {
                this.glb.ShowPin = true;
                this.glb.NUMCOMPTE = userdata.login;
                this.storage.set('login', userdata.login);
                this.serv.showAlert(souscription.returnMsg);
                setTimeout(() => {
                  this.navCtrl.navigateRoot('utilisateur');
                }, 200);
              } else {
                this.serv.showError(souscription.errorLabel);
              }
            } else {
              this.serv.showError('Reponse inattendue');
            }


          }).catch(err => {
            this.serv.dismissloadin();
            if (err.status === 500) {
              this.serv.showError('Une erreur interne s\'est produit ERREUR 500');
            } else {
              this.serv.showError('Impossible d\'atteindre le serveur veuillez réessayer');
            }
          });

        } else {
          this.serv.dismissloadin();
          this.serv.showError(reponse.errorLabel);
        }
      } else {
        this.serv.showError('Reponse inattendue ');
      }


    }).catch(err => {
      this.serv.dismissloadin();
      if (err.status === 500) {
        this.serv.showError('Une erreur interne s\'est produit ');
      } else {
        this.serv.showError('Impossible d\'atteindre le serveur veuillez réessayer');
      }
    });

  }

}
