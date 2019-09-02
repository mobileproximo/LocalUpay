import { Injectable } from '@angular/core';
import { SQLiteObject } from '@ionic-native/sqlite/ngx';

@Injectable({
  providedIn: 'root'
})
export class GlobalVariableService {
  public showPin = false;
  public IMG_URL = 'assets/images/';
 // public BASEURL = 'http://196.207.207.63:8080/upayMobile/';
  public BASEURL = 'http://196.207.245.99:8282/upayMobile/';
  public IDPART = '';
  public IDSESS = '';
  public IDTERM = '';
  public PIN = '';
  public ISCONNECTED = true;
  public HEADER: any = { agence: '', montant: '0', numcompte: '', consomme: '' };
  public HEADERTITELE = { title: '', src: '' };
  public recu: any;
  public notfound = false;
  public message = '';
  public dateUpdate = '';
  public minenlevement: any = 200000;
  public listeImprimantes: any;
  public statusImpriamte = false;
  public showRecu = false;
  public ShowPin = true;
  public ShowSolde = false;
  public modeTransactionnel = false;
  public liaisonreussie = false;
  public DATEPAUSE;
  public DATEREPRISE;
  public READCODEOTP = '';
  public PRENOM = 'Dame';
  public NOM = 'Camara';
  public active1 = false;
  public active2 = false;
  public active3 = false;
  public active4 = false;
  public ATPS_TIGO_IDMERCHAND = 1213;
  public ATPS_OM_IDMERCHAND = 1213;
  PHONE: any ;
  NUMCOMPTE: any = '';
  URLUPLOAD = 'http://192.168.4.63:8080/amifa-1/';
  isLoadingShowing = false;
  isErrorShowing = false;
  showheader = true;
  database: SQLiteObject;
  // tslint:disable-next-line: max-line-length
  public OperatorsImages = [{ codeoper: '0054', image: this.IMG_URL + 'emoney.png', sousop: '' }, { codeoper: '0025', image: this.IMG_URL + 'omoney.png', sousop: '' },
  // tslint:disable-next-line: max-line-length
  { codeoper: '0053', image: this.IMG_URL + 'postecash.png', sousop: '0001' }, { codeoper: '0022', image: this.IMG_URL + 'logo_Tigo Cash.png', sousop: '' },
  // tslint:disable-next-line: max-line-length
  { codeoper: '0057', image: this.IMG_URL + 'wizall.png', sousop: '' }, { codeoper: '0016', image: this.IMG_URL + 'sde2.png', sousop: '' }, { codeoper: '0034', image: this.IMG_URL + 'logo_Expresso.png', sousop: '' },
  // tslint:disable-next-line: max-line-length
  { codeoper: '0027', image: this.IMG_URL + 'Petite-Icon-24.png', sousop: '' }, { codeoper: '0029', image: this.IMG_URL + 'woyofal.png', sousop: '' }, { codeoper: '0020', image: this.IMG_URL + 'logo_Tigo.png', sousop: '' },
  // tslint:disable-next-line: max-line-length
  { codeoper: '0005', image: this.IMG_URL + 'logo_Orange.png', sousop: '' }, { codeoper: '0057', image: this.IMG_URL + 'logo_rapido.png', sousop: '0002' }, { codeoper: '0052', image: this.IMG_URL + 'logo_Proxicash.png', sousop: '' },
  ];
  public MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet',
    'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  constructor() { }
}
