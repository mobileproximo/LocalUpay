import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidatorPhone } from 'src/app/components/customValidator/custom-validator';
import { PinValidationPage } from '../../utilisateur/pin-validation/pin-validation.page';
import { ModalController } from '@ionic/angular';
import { GlobalVariableService } from 'src/app/services/global-variable.service';
import { ServiceService } from 'src/app/services/service.service';
import { ConfirmationComponent } from 'src/app/components/confirmation/confirmation.component';
import { MillierPipe } from 'src/app/pipes/millier.pipe';

@Component({
  selector: 'app-marchand',
  templateUrl: './marchand.page.html',
  styleUrls: ['./marchand.page.scss'],
})
export class MarchandPage implements OnInit {
  public headerTitle = 'marchand';
  public rechargeForm: FormGroup;
  public listeServiceDisponible = [{ nomoper: 'Orange Money', codeoper: '0005' },
                                   { nomoper: 'Tigo Cash', codeoper: '0022' },  { nomoper: 'E-Money', codeoper: '0054' }];
  codepin: any;
  constructor(private formBuilder: FormBuilder,
              private modal: ModalController,
              private millier: MillierPipe,
              private glb: GlobalVariableService,
              private serv: ServiceService) {
    this.rechargeForm = this.formBuilder.group({
      codemarchand: ['', Validators.required],
      montant: ['', Validators.required],
      oper: ['0005', Validators.required],
      nomoperateur: [''],
      pays: ['SN', Validators.required],
      pin: [''],

    });
  }

  ngOnInit() {
  }

  async showpin() {
    this.rechargeForm.controls.pin.setValue('');
    const modal = await this.modal.create({
      component: PinValidationPage,
      backdropDismiss: true
    });
    modal.onDidDismiss().then((codepin) => {
      if (codepin !== null && codepin.data) {
        this.rechargeForm.controls.pin.setValue(codepin.data);
        this.paiementmarchand();
      } else {
        this.glb.ShowSolde = false;
      }
    });
    return await modal.present();
  }
  paiementmarchand() {
    const parametres: any = {};
    this.rechargeForm.controls.nomoperateur.setValue(this.getNomoperateur());
    parametres.recharge = this.rechargeForm.getRawValue();
    if (parametres.recharge.oper === '0005') {
    parametres.recharge.clientmarchandCode =  '01';
    }
    if (parametres.recharge.oper === '0022') {
      parametres.recharge.clientmarchandCode = '02';
    }
    if (parametres.recharge.oper === '0054') {
      parametres.recharge.clientmarchandCode = '03';
    }
    parametres.idTerm = this.glb.IDTERM;
    parametres.session = this.glb.IDSESS;
    console.log(JSON.stringify(parametres));
    this.serv.afficheloading();
    this.serv.posts('recharge/paiementmarchand.php', parametres, {}).then(data => {
      this.serv.dismissloadin();
      const reponse = JSON.parse(data.data);
      if (reponse.returnCode) {
        if (reponse.returnCode === '0') {
          this.rechargeForm.controls.oper.setValue('0005');
          this.rechargeForm.controls.pin.setValue('');
          this.rechargeForm.controls.montant.setValue('');
          this.rechargeForm.controls.codemarchand.setValue('');
          this.glb.HEADER.montant = this.millier.transform(reponse.mntPlfap);
          this.glb.dateUpdate = this.serv.getCurrentDate();
          parametres.recharge.montant = this.millier.transform(reponse.montant);
          parametres.recharge.frais = this.millier.transform(reponse.frais);
          parametres.recharge.nameContact = this.glb.PRENOM + ' ' + this.glb.NOM;
          parametres.recharge.label = 'Code Marchand';
          parametres.recharge.telephone = reponse.telephone;
          parametres.recharge.montantTotal = this.millier.transform(reponse.montantTTC);
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
    })
      .catch(err => {
        if (err.status === 500) {
          this.serv.showError('Une erreur interne s\'est produite ERREUR 500');
        } else {
          this.serv.showError('Impossible d\'atteindre le serveur veuillez réessayer');
        }

      });
  }
  getNomoperateur() {
    let i = 0;
    const codeoper = this.rechargeForm.controls.oper.value;
    while (i < this.listeServiceDisponible.length && this.listeServiceDisponible[i].codeoper != codeoper) {
      i++;
    }
    return this.listeServiceDisponible[i].nomoper;
  }
}
