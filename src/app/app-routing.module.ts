import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'utilisateur', pathMatch: 'full' },
  { path: 'home', loadChildren: './pages/home/home.module#HomePageModule' },
  { path: 'paiement', loadChildren: './pages/paiement/paiement.module#PaiementPageModule' },
  { path: 'reception', loadChildren: './pages/reception/reception.module#ReceptionPageModule' },
  { path: 'envoi', loadChildren: './pages/envoi/envoi.module#EnvoiPageModule' },
  { path: 'favoris', loadChildren: './pages/favoris/favoris.module#FavorisPageModule' },
  { path: 'utilisateur', loadChildren: './pages/utilisateur/utilisateur.module#UtilisateurPageModule' },
  { path: 'historique', loadChildren: './pages/historique/historique.module#HistoriquePageModule' },
  { path: 'compte', loadChildren: './pages/compte/compte.module#ComptePageModule' },
  { path: 'test', loadChildren: './test/test.module#TestPageModule' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
