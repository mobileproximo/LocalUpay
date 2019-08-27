import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidatorPhone } from 'src/app/components/customValidator/custom-validator';
import { PinValidationPage } from '../../utilisateur/pin-validation/pin-validation.page';
import { ModalController } from '@ionic/angular';
import { GlobalVariableService } from 'src/app/services/global-variable.service';
import { ServiceService } from 'src/app/services/service.service';

@Component({
  selector: 'app-marchand',
  templateUrl: './marchand.page.html',
  styleUrls: ['./marchand.page.scss'],
})
export class MarchandPage implements OnInit {
  public headerTitle = 'marchand';
  public rechargeForm: FormGroup;
  public listeServiceDisponible = [{nomoper: 'Orange Money', codeoper: '0005'}, {nomoper: 'Tigo Cash', codeoper: '0022'}];
  codepin: any;
  constructor(private formBuilder: FormBuilder,
              private modal: ModalController,
              private glb: GlobalVariableService,
              private serv: ServiceService) {
    this.rechargeForm = this.formBuilder.group({
      codemarchand: ['', Validators.required],
      montant: ['', Validators.required],
      oper: ['0005', Validators.required],
      nomoperateur: [''],
      pays: ['SN', Validators.required],
      pin: ['', Validators.required],

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
    parametres.idTerm = this.glb.IDTERM;
    parametres.session = this.glb.IDSESS;
    console.log(JSON.stringify(parametres));
    this.serv.afficheloading();
    this.serv.posts('recharge/paiementmarchand.php', parametres, {}).then(data => {
      this.serv.dismissloadin();
      const reponse = JSON.parse(data.data);
      if (reponse.returnCode) {
        if (reponse.returnCode === '0') {
        }
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
