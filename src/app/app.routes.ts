import { Routes } from '@angular/router';
// Importação dos Guardas do Firebase
import { canActivate, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';

// Funções auxiliares para os Guardas
// Se não estiver logado, manda para o Login
const redirecionarParaLogin = () => redirectUnauthorizedTo(['/login']);
// Se JÁ estiver logado, manda para a Home
const redirecionarParaHome = () => redirectLoggedInTo(['/home']);

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage),
    // AQUI ESTÁ O SEGREDO: Se já tiver conta logada, pula essa tela e vai pra Home
    ...canActivate(redirecionarParaHome)
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./pages/cadastro/cadastro.page').then( m => m.CadastroPage),
    // Cadastro também: se já tá logado, não precisa ver isso
    ...canActivate(redirecionarParaHome)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    // Protege a Home: Só entra se estiver logado
    ...canActivate(redirecionarParaLogin)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.page').then( m => m.PerfilPage),
    ...canActivate(redirecionarParaLogin)
  },
  {
    path: 'treino-detalhe/:tipo/:biotipo',
    loadComponent: () => import('./pages/treino-detalhe/treino-detalhe.page').then( m => m.TreinoDetalhePage),
    ...canActivate(redirecionarParaLogin)
  },
  {
    path: 'evolucao',
    loadComponent: () => import('./pages/evolucao/evolucao.page').then( m => m.EvolucaoPage),
    ...canActivate(redirecionarParaLogin)
  },
  {
    path: 'calculadora',
    loadComponent: () => import('./pages/calculadora/calculadora.page').then( m => m.CalculadoraPage)
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.page').then( m => m.AdminPage)
  },
  {
    path: 'admin/usuario-detalhe/:id',
    loadComponent: () => import('./pages/admin/usuario-detalhe/usuario-detalhe.page').then( m => m.UsuarioDetalhePage)
  },
  {
    path: 'dieta',
    loadComponent: () => import('./pages/dieta/dieta.page').then( m => m.DietaPage)
  },
];