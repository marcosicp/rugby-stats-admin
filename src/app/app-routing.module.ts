import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { FireAdminComponent } from './fire-admin.component';
import { AsistenciaComponent } from './components/jugadores/asistencia/asistencia.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';
import { SettingsComponent } from './components/settings/settings.component';
// import { PostsTranslateComponent } from './components/posts/translate/posts-translate.component';
import { UsersListComponent } from './components/users/list/users-list.component';
import { UsersAddComponent } from './components/users/add/users-add.component';
// import { UsersProfileComponent } from './components/users/profile/users-profile.component';
import { UsersEditComponent } from './components/users/edit/users-edit.component';
import { TranslationsComponent } from './components/translations/translations.component';
import { UserGuard } from './guards/user.guard';
import { RegisterComponent } from './components/register/register.component';
import { RegisterGuard } from './guards/register.guard';
import { LogoutComponent } from './components/logout/logout.component';
import { JugadoresListComponent } from './components/jugadores/list/jugadores-list.component';
import { JugadoresAddComponent } from './components/jugadores/add/jugadores-add.component';
// import { PartidosListComponent } from './components/partidos/list/posts-list.component';
import { PartidosAddComponent } from './components/partidos/add/partidos-add.component';
import { PartidosListComponent } from './components/partidos/list/partidos-list.component';
import { PartidosEditComponent } from './components/partidos/edit/partidos-edit.component';
import { EntrenamientosListComponent } from './components/entrenamientos/list/entrenamientos-list.component';
import { EntrenamientosAddComponent } from './components/entrenamientos/add/entrenamientos-add.component';
import { EntrenamientosEditComponent } from './components/entrenamientos/edit/entrenamientos-edit.component';
import { JugadoresEditComponent } from './components/jugadores/edit/jugadores-edit.component';
import { JugadoresProfileComponent } from './components/jugadores/profile/jugadores-profile.component';
import { EquiposEditComponent } from './components/equipos/edit/equipos-edit.component';
import { EquiposAddComponent } from './components/equipos/add/equipos-add.component';
import { EquiposListComponent } from './components/equipos/list/equipos-list.component';
import { DivisionesListComponent } from './components/divisiones/list/divisiones-list.component';
import { DivisionesAddComponent } from './components/divisiones/add/divisiones-add.component';
import { DivisionesEditComponent } from './components/divisiones/edit/divisiones-edit.component';
import { AppComponent } from './app.component';
import { FireAdminComponent } from './fire-admin.component';

const routes: Routes = [
  {
    path: '',
    component: FireAdminComponent,
    children: [
      // { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      // Login
      {
        path: 'login',
        component: LoginComponent,
        canActivate: [LoginGuard]
      },
      // Logout
      {
        path: 'logout',
        component: LogoutComponent
      },
      // Register
      {
        path: 'register',
        component: RegisterComponent,
        canActivate: [RegisterGuard]
      },
      // Dashboard
      {
        path: 'dashboard',
        // component: DashboardComponent,
        canActivate: [AuthGuard],
        children:[
          { path: 'dashboard', redirectTo: '', pathMatch: 'full' },
          {
            path: '',
            component: DashboardComponent,
            // canActivate: [AuthGuard2],
          },
        ]
      },
      // Settings
      {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [AuthGuard]
      },
      // Divisiones
      {
        path: 'divisiones',
        canActivate: [AuthGuard],
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          {
            path: 'list',
            component: DivisionesListComponent
          },
          {
            path: 'list/author/:authorId',
            component: DivisionesListComponent
          },
          {
            path: 'add',
            component: DivisionesAddComponent
          },
          {
            path: 'edit/:id',
            component: DivisionesEditComponent
          },
          {
            path: '**',
            redirectTo: 'list'
          }
        ]
      },
      // Equipos
      {
        path: 'equipos',
        canActivate: [AuthGuard],
        children: [
          {
            path: 'list',
            component: EquiposListComponent
          },
          {
            path: 'list/author/:authorId',
            component: EquiposListComponent
          },
          {
            path: 'add',
            component: EquiposAddComponent
          },
          {
            path: 'edit/:id',
            component: EquiposEditComponent
          },
          {
            path: '**',
            redirectTo: 'list'
          }
        ]
      },
      // Partidos
      {
        path: 'partidos',
        canActivate: [AuthGuard],
        children: [
          {
            path: 'list',
            component: PartidosListComponent
          },
          {
            path: 'list/status/:status',
            component: PartidosListComponent
          },
          {
            path: 'list/category/:categoryId',
            component: PartidosListComponent
          },
          {
            path: 'list/author/:authorId',
            component: PartidosListComponent
          },
          {
            path: 'add',
            component: PartidosAddComponent
          },
          {
            path: 'edit/:id',
            component: PartidosEditComponent
          },
          // {
          //   path: 'translate/:id',
          //   component: PostsTranslateComponent
          // },
          // {
          //   path: 'categories',
          //   component: PostsCategoriesComponent
          // },
          {
            path: '**',
            redirectTo: 'list'
          }
        ]
      },
      // Partidos
      {
        path: 'entrenamientos',
        canActivate: [AuthGuard],
        children: [
          {
            path: 'list',
            component: EntrenamientosListComponent
          },
          {
            path: 'list/status/:status',
            component: EntrenamientosListComponent
          },
          {
            path: 'list/category/:categoryId',
            component: EntrenamientosListComponent
          },
          {
            path: 'list/author/:authorId',
            component: EntrenamientosListComponent
          },
          {
            path: 'add',
            component: EntrenamientosAddComponent
          },
          {
            path: 'edit/:id',
            component: EntrenamientosEditComponent
          },
          // {
          //   path: 'translate/:id',
          //   component: PostsTranslateComponent
          // },
          // {
          //   path: 'categories',
            // component: PostsCategoriesComponent
          // },
          {
            path: '**',
            redirectTo: 'list'
          }
        ]
      },
      // Users
      {
        path: 'users',
        canActivate: [AuthGuard],
        children: [
          {
            path: 'list',
            component: UsersListComponent,
            canActivate: [UserGuard]
          },
          {
            path: 'list/role/:role',
            component: UsersListComponent,
            canActivate: [UserGuard]
          },
          {
            path: 'add',
            component: UsersAddComponent,
            canActivate: [UserGuard]
          },
          {
            path: 'edit/:id',
            component: UsersEditComponent,
            canActivate: [UserGuard]
          },
          // {
          //   path: 'profile/:id',
          //   component: UsersProfileComponent,
          //   canActivate: [UserGuard]
          // },
          {
            path: '**',
            redirectTo: 'list'
          }
        ]
      },
      // Jugadores
      {
        path: 'jugadores',
        canActivate: [AuthGuard],
        children: [
          {
            path: 'list',
            component: JugadoresListComponent,
            // canActivate: [UserGuard]
          },
          {
            path: 'list/role/:role',
            component: JugadoresListComponent,
            // canActivate: [UserGuard]
          },
          {
            path: 'add',
            component: JugadoresAddComponent,
            // canActivate: [UserGuard]
          },
          {
            path: 'edit/:id',
            component: JugadoresEditComponent,
            // canActivate: [UserGuard]
          },
          {
            path: 'profile/:id',
            component: JugadoresProfileComponent,
            // canActivate: [UserGuard]
          },
          {
            path: '**',
            redirectTo: 'list'
          }
        ]
      },
      // Translations
      {
        path: 'translations',
        component: TranslationsComponent,
        canActivate: [AuthGuard]
      },
      // Asistencia
      {
        path: 'asistencia/:identrenamiento',
        component: AsistenciaComponent
        // canActivate: [AuthGuard]
      },
      // 404
      {
        path: '**',
        redirectTo: 'dashboard'
      }
    ],
    
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class FireAdminRoutingModule { }
