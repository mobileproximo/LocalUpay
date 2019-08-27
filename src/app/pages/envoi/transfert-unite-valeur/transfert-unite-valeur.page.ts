import { Component, OnInit } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Platform, ModalController } from '@ionic/angular';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { ServiceService } from 'src/app/services/service.service';
import { MillierPipe } from 'src/app/pipes/millier.pipe';
import { GlobalVariableService } from 'src/app/services/global-variable.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidatorPhone } from 'src/app/components/customValidator/custom-validator';
import { PinValidationPage } from '../../utilisateur/pin-validation/pin-validation.page';
import { ConfirmationComponent } from 'src/app/components/confirmation/confirmation.component';
declare var SMSReceive: any;
@Component({
  selector: 'app-transfert-unite-valeur',
  templateUrl: './transfert-unite-valeur.page.html',
  styleUrls: ['./transfert-unite-valeur.page.scss'],
})
export class TransfertUniteValeurPage implements OnInit {
  public headerTitle = 'MOGA';
  token: string;
  numtrx: any;
  sousop: any;
  idtrxEmoney: any;
  codepin = '';
  public rechargeForm: FormGroup;
  private listeServiceDisponible = ['0005', '0054', '0057', '0053', '0022'];
  constructor(public androidPermissions: AndroidPermissions,
              public platform: Platform,
              public callNumber: CallNumber,
              public millier: MillierPipe,
              public glb: GlobalVariableService,
              public serv: ServiceService,
              public modal: ModalController,
              private formbuilder: FormBuilder) {
    this.rechargeForm = this.formbuilder.group({
      telephone: ['', [Validators.required, CustomValidatorPhone]],
      montantrlv: ['', Validators.required],
      montant: ['', Validators.required],
      service: ['0005', Validators.required],
      oper: [''],
      frais: [''],
      sousop: ['']
    });
   // alert('je suis ');
    this.smsreceiver();
  }

  ngOnInit() {
    // this.smsreceiver();
    // this.checkPermission();
  }
  smsreceiver() {
    this.platform.ready().then(() => {
      if (SMSReceive) {
      this.startWatching();
      document.addEventListener('onSMSArrive', (e: any) => {
        const IncomingSMS = e.data;
        this.processSMS(IncomingSMS);
    });
      } else {
        this.serv.showError('Impossible de lire un sms entrant');
        alert('nok');
      }
    });
  }

  ionViewDidLeave() {
    this.stopwatching();
  }
  checkPermission() {
    this.platform.ready().then(() => {
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.RECEIVE_SMS).then(
        result => {
          alert('Has permission? ' + result.hasPermission);
          this.watchingSMS();
        },
        err => {

          this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.RECEIVE_SMS).then(r => {
            this.watchingSMS();
          }).catch((err) => {

          });
        }
      );
      this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.RECEIVE_SMS]);

    });

  }
  watchingSMS() {
    if ((/(ipad|iphone|ipod|android)/i.test(navigator.userAgent))) {
      this.startWatching();
      document.addEventListener('onSMSArrive', (e: any) => {
        const sms: any = e.data;
        this.processSMS(sms);
      });
    }
  }
  stopwatching() {
    SMSReceive.stopWatch(
      () => { alert('watch stopped'); },
      () => { alert('watch stop failed'); }
    );
  }

  startWatching() {
    SMSReceive.startWatch(
      () => {  },
      () => {  }
    );
  }

  restartWatching() {
    SMSReceive.stopWatch(
      () => {
        this.startWatching();
      },
      () => {  }
    );
  }
  processSMS(sms: any) {
    const expediteur = sms.address.toUpperCase();
    const message = sms.body;
    alert(JSON.stringify(sms));
    if (expediteur === 'ORANGEMONEY') {
      this.processOrangeMoney(message);
    }
    if (expediteur === 'WIZALLMONEY') {
      this.processWizall(message);
    }
    if (expediteur === 'E-MONEY') {
      this.processEmoney(message);
    }
    if (expediteur === 'POSTECASH') {
      this.processpostecash(message);
    }
    if (expediteur === 'TIGO-CASH') {
      this.processTigoCash(message);
    }
/*     setTimeout(() => {
      this.restartWatching();
    }, 200); */
  }
  processTigoCash(message: string) {
    if (message.includes('Paiement pour MERCHAND (' + this.glb.ATPSTIGOIDMERCHAND + ')')) {
      this.cashinUPay();
    }
  }

  processOrangeMoney(message: string) {
    if (message.substr(0, 30) === 'Vous allez faire un retrait de') {
      setTimeout(() => {
        this.callNumber.callNumber('#144#', true)
          .then(res => { })
          .catch(err => {
            this.serv.dismissloadin();
          });
      }, 200);

    }
    if (message.substr(0, 16) === 'Vous avez retire') {
      setTimeout(() => {
        this.numtrx = this.glb.PHONE;
        this.cashinUPay();
      }, 200);
    }
  }
  processWizall(message: string) {

    if (message.substr(0, 24) === 'Bonjour, votre code de s') {
      const otp = message.substring(message.length - 6);
      const url = 'https://testwpay.wizall.com/api/merchant/cashout/confirm/';
      // const url = 'https://testwpay.wizall.com/api/merchant/cashout/confirm';
      const header = { Authorization: 'Bearer ' + this.token };
      const params = { otp, msisdn: '765697413', merchant_msisdn: '773914791', merchant_pin: '1001' };
      this.serv.post(url, params, header).then(data => {
        this.serv.dismissloadin();
        // this.serv.dismissloadin();
        const reponse = JSON.parse(data.data);
        // alert('reponse confirm ' + JSON.stringify(reponse));
        if (reponse.Operation) {
          if (reponse.Operation === 'MerchantGetMoneyConfirm') {
            this.numtrx = this.glb.PHONE;
            this.cashinUPay();
          } else {
            alert(JSON.stringify(reponse));
          }
        } else {
          alert(JSON.stringify(reponse));

        }
      })
        .catch(err => {
          this.serv.dismissloadin();
          if (err.status === 500) {
            this.serv.showError('Une erreur interne s\'est produite ERREUR 500 ' + JSON.stringify(err));
          } else {
            this.serv.showError('Impossible d\'atteindre le serveur veuillez réessayer ' + JSON.stringify(err));
          }
        });

    }
  }
  processEmoney(message: string) {
    if (message.indexOf('OTP') !== -1) {
      setTimeout(() => {
        const otp = message.substring(message.indexOf('OTP:') + 5, message.indexOf('. Ref:'));
        const parametres: any = {};
        parametres.recharge = {};
        parametres.recharge.numtrx = this.idtrxEmoney;
        parametres.recharge.codevalidation    = otp;
        parametres.recharge.montant   = this.rechargeForm.controls.montantrlv.value.replace(/ /g, '');
        this.serv.posts('recharge/validationemoney.php', parametres, {}).then(data => {
          const reponse = JSON.parse(data.data);
          if (reponse.returnCode) {

            if (reponse.returnCode === '0') {
              // this.cashinUPay();
            } else { this.serv.dismissloadin(); this.serv.showError(reponse.errorLabel); }
          } else {
            this.serv.dismissloadin();
            this.serv.showError('Reponse inattendue');
          }
        }).catch(err => {
          this.serv.dismissloadin();
          if (err.status === 500) {
            this.serv.showError('Une erreur interne s\'est produite ERREUR 500 ' + JSON.stringify(err));
          } else {
            this.serv.showError('Impossible d\'atteindre le serveur veuillez réessayer ' + JSON.stringify(err));
          }
        });

      }, 3000);


    }
  }
  processpostecash(message) {
    if (message.substr(0, 42) === 'Vous avez effectue une demande de debit de') {
      const v = message.substr(message.indexOf(':') + 2, message.indexOf('.'));
      const otp = v.substr(0, v.indexOf('.'));
      const parametre: any = {};
      parametre.recharge = {};
      parametre.recharge.telephone = this.glb.PHONE;
      parametre.recharge.codevalidation = otp;
      parametre.recharge.montant = this.rechargeForm.controls.montantrlv.value.replace(/ /g, '');
      parametre.recharge.pin = this.codepin;
      parametre.idTerm = this.glb.IDTERM;
      parametre.session = this.glb.IDSESS;
      this.serv.posts('recharge/retraitpostcash.php', parametre, {}).then(data => {
          this.serv.dismissloadin();
          const reponse = JSON.parse(data.data);
          if (reponse.returnCode === '0') {
            this.numtrx = this.glb.PHONE;
            this.glb.HEADER.montant = this.millier.transform(reponse.mntPlfap);
            this.cashinUPay();
          } else {
            this.serv.showError(reponse.errorLabel);
          }
        }).catch(err => {
          this.serv.dismissloadin();
          this.serv.showError('Impossible d\'atteindre le serveur');
        });


     }
  }
  cashinUPay() {
    const parametres: any = {};
    parametres.recharge = {};
    parametres.recharge.nomClient = this.glb.PRENOM + ' ' + this.glb.NOM;
    parametres.recharge.sousoper = this.sousop;
    parametres.recharge.numtrx = this.numtrx;
    parametres.recharge.oper      = this.rechargeForm.controls.service.value;
    parametres.recharge.codeEs = '221' + this.glb.PHONE;
    parametres.recharge.montant = this.rechargeForm.controls.montantrlv.value.replace(/ /g, '');
    parametres.recharge.telephone = this.glb.PHONE; // datarecharge.recharge.telephone.replace(/-/g, '');
    parametres.idTerm = this.glb.IDTERM;
    parametres.session = this.glb.IDSESS;
    this.serv.posts('recharge/cashinMoga.php', parametres, {}).then(data => {
      this.serv.dismissloadin();
      const reponse = JSON.parse(data.data);
      if (reponse.returnCode) {
        if (reponse.returnCode === '0') {
          this.glb.HEADER.montant = this.millier.transform(reponse.mntPlfap);
          this.glb.dateUpdate = this.serv.getCurrentDate();
          parametres.recharge.montant    = this.millier.transform(parametres.recharge.montant);
          parametres.recharge.nameContact = this.glb.PRENOM + ' ' + this.glb.NOM;
          parametres.recharge.label = 'N° Tel';
          const mod = this.modal.create({
            component: ConfirmationComponent,
            componentProps: {
              data: parametres.recharge,
            }
          }).then((e) => {
            e.present();
            e.onDidDismiss().then(() => {
            });
          });
        } else {
          this.serv.showError(reponse.errorLabel);
        }
      } else {
        this.serv.showError('Reponse inattendue  ');
      }

    }
    ).catch(err => {
      this.serv.dismissloadin();
      if (err.status === 500) {
        this.serv.showError('Une erreur interne s\'est produit ERREUR 500');
      } else {
        this.serv.showError('Impossible d\'atteindre le serveur veuillez réessayer');
      }
    });
  }
  async showPin() {
    const service = this.rechargeForm.controls.service.value;
    if (!this.listeServiceDisponible.includes(service)) {
      this.serv.showAlert('Service en cours developpement');
    } else {
      const modal = await this.modal.create({
        component: PinValidationPage,
        backdropDismiss: true
      });
      modal.onDidDismiss().then((codepin) => {
        if (codepin !== null && codepin.data) {
          this.codepin = codepin.data;
          this.initier();
        } else {
          this.glb.ShowSolde = false;
        }
      });
      return await modal.present();

    }


  }
  initier() {
    const service = this.rechargeForm.controls.service.value;

    switch (service) {
      case '0005' || '0054' || '0053': {
        const transfert = { montant: this.rechargeForm.controls.montantrlv.value, telSource: this.glb.PHONE, opersource: service };
        const params = {
          transfert,
          idTerm: this.glb.IDTERM,
          session: this.glb.IDSESS
        };
        const data: any = {};
        data.idTerm = this.glb.IDTERM;
        data.session = this.glb.IDSESS;
        this.serv.afficheloadingWithExit();
        this.serv.posts('recharge/initcashoutoper.php', params, {}).then(data => {
          const reponse = JSON.parse(data.data);
          if (reponse.returnCode) {
            if (reponse.returnCode === '0') {
              if (service === '0054') {
                this.idtrxEmoney = reponse.numtrx;
              }

            } else {
              this.serv.showError(reponse.errorLabel);
            }

          } else {
            this.serv.showError('Reponse inattendue ');
          }
        }
        ).catch(err => {
          this.serv.dismissloadin();
          if (err.status === 500) {
            this.serv.showError('Une erreur interne s\'est produit ERREUR 500');
          } else {
            this.serv.showError('Impossible d\'atteindre le serveur veuillez réessayer');
          }
        });
        break;
      }

      case '0057': {
        const params = {
          username: 'test',
          password: 'jdkwq01276329021',
          client_id: 'jdsjkw9021843092-02198322332n',
          // tslint:disable-next-line: max-line-length
          client_secret: 'WTwiygwawd3d3d32erfnBk2dHiwVrP4nW6Ip2EBXyuZLHAJ14tDx7a490LKQvdkMiBIiAtY3RRXmMMU11zSKEPzu88ewwwefrfewmauPEvJdo4VeVhGTkwahJeXhZ7EKZXCd3tU',
          client_type: 'public',
          grant_type: 'password'
        };
        this.serv.afficheloadingWithExit();
        let url = 'https://testwpay.wizall.com/o/token/';
        this.serv.post(url, params).then(data => {
          // this.serv.dismissloadin();

          const reponse = JSON.parse(data.data);
          // alert('reponse Token ' + JSON.stringify(reponse));
          if (reponse.access_token) {
            url = 'https://testwpay.wizall.com/api/merchant/cashout/';
            // tslint:disable-next-line: no-shadowed-variable
            const params = {
              msisdn: '765697413',
              merchant_msisdn: '773914791',
              merchant_pin: '1001',
              amount: '1'
            };
            this.token = reponse.access_token;
            const header = { Authorization: 'Bearer ' + reponse.access_token };
            this.serv.post(url, params, header).then(data => {
              // this.serv.dismissloadin();
              const reponse = JSON.parse(data.data);
              //  alert('reponse init ' + JSON.stringify(reponse));
            })

              .catch(err => {
                this.serv.dismissloadin();
                if (err.status === 500) {
                  this.serv.showError('Une erreur interne s\'est produite ERREUR 500 ' + JSON.stringify(err));
                } else {
                  this.serv.showError('Impossible d\'atteindre le serveur veuillez réessayer ' + JSON.stringify(err));
                }
              });
          }
        })
          .catch(err => {
            this.serv.dismissloadin();
            if (err.status === 500) {
              this.serv.showError('Une erreur interne s\'est produit ERREUR 500 ' + JSON.stringify(err));
            } else {
              this.serv.showError('Impossible d\'atteindre le serveur veuillez réessayer' + JSON.stringify(err));
            }
          });
        break;
      }
      case '0022' : {
        this.serv.afficheloadingWithExit();
        setTimeout(() => {
          const  reference = this.serv.generateUniqueId();
          const commande = '#150*4*6*' + this.glb.ATPSTIGOIDMERCHAND + '*' + reference + '*1#';
          this.callNumber.callNumber(commande, true)
            .then(res => { })
            .catch(err => {
              this.serv.dismissloadin();
            });
        }, 200);
        break;
      }
      default: {
        this.serv.showAlert('Service en cours developpement');
        break;
      }
    }

  }



}
