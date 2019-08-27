import { Component, OnInit } from '@angular/core';
import {NavController} from '@ionic/angular';

@Component({
  selector: 'app-bienvenu',
  templateUrl: './bienvenue.page.html',
  styleUrls: ['./bienvenue.page.scss'],
})
export class BienvenuePage implements OnInit {

  constructor(public navCtrl: NavController
    ) { }

  ngOnInit() {
  }

  accueil(){
    this.navCtrl.navigateRoot('utilisateur/acceuil');
  }
  verscompte(){
    this.navCtrl.navigateForward('compte');
  }

}

