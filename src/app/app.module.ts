import { CommonModule, HashLocationStrategy, LocationStrategy } from "@angular/common";
import { NgModule, ModuleWithProviders, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
// import { FireAdminComponent } from "./fire-admin.component";
import { AsistenciaComponent } from './components/jugadores/asistencia/asistencia.component';
import { FireAdminRoutingModule } from "./app-routing.module";
import { LoginComponent } from "./components/login/login.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { SidebarComponent } from "./components/shared/sidebar/sidebar.component";
import { NavbarComponent } from "./components/shared/navbar/navbar.component";
import { I18nService } from "./services/i18n.service";
import { TranslatePipe } from "./pipes/translate.pipe";
import { environment } from '../environments/environment';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  AngularFireModule,
  FirebaseOptions,
  FirebaseOptionsToken,
} from "@angular/fire";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AngularFireFunctionsModule } from "@angular/fire/functions";
import { AngularFireAuthModule } from "@angular/fire/auth";
// import { FireAdminService } from "./fire-admin.service";
import { AuthService } from "./services/auth.service";
import { AuthGuard } from "./guards/auth.guard";
import { NavigationService } from "./services/navigation.service";
import { LoginGuard } from "./guards/login.guard";
import { FooterComponent } from "./components/shared/footer/footer.component";
// import { PartidosListComponent } from './components/partidos/list/partidos-list.component';
import { PartidosAddComponent } from "./components/partidos/add/partidos-add.component";
import { SettingsComponent } from "./components/settings/settings.component";
import { LayoutComponent } from "./components/shared/layout/layout.component";
import { AlertService } from "./services/alert.service";
import { LocalStorageService } from "./services/local-storage.service";
import { SettingsService } from "./services/settings.service";
import { AlertComponent } from "./components/shared/alert/alert.component";
import { ButtonGroupComponent } from "./components/shared/button-group/button-group.component";
import { DatabaseService } from "./services/database.service";
import { CategoriesService } from "./services/collections/categories.service";
import { DataTablesModule } from "angular-datatables";
import { PartidosService } from "./services/collections/partidos.service";
import { EscapeUrlPipe } from "./pipes/escape-url.pipe";
import { AngularFireStorageModule } from "@angular/fire/storage";
import { StorageService } from "./services/storage.service";
// import { PostsTranslateComponent } from './components/posts/translate/posts-translate.component';
import { UsersListComponent } from "./components/users/list/users-list.component";
import { UsersAddComponent } from "./components/users/add/users-add.component";
// import { UsersProfileComponent } from "./components/users/profile/users-profile.component";
import { UsersService } from "./services/collections/users.service";
import { FirebaseUserService } from "./services/firebase-user.service";
import { UsersEditComponent } from "./components/users/edit/users-edit.component";
import { LoadingIndicatorComponent } from "./components/shared/loading-indicator/loading-indicator.component";
import { TranslationsComponent } from "./components/translations/translations.component";
// import { TranslationsService } from './services/collections/translations.service';
import { EquiposService } from "./services/collections/equipos.service";
// import { PagesTranslateComponent } from './components/pages/translate/pages-translate.component';
import { UserGuard } from "./guards/user.guard";
import { CurrentUserService } from "./services/current-user.service";
import { RegisterComponent } from "./components/register/register.component";
import { RegisterGuard } from "./guards/register.guard";
import { ConfigService } from "./services/collections/config.service";
import { LogoutComponent } from "./components/logout/logout.component";
import { ShortDatePipe } from "./pipes/shortdate.pipe";
import { DateTimePipe } from "./pipes/datetime.pipe";
import { TimestampPipe } from "./pipes/timestamp.pipe";

// Register locales for date pipe
import { registerLocaleData } from "@angular/common";
import localeFr from "@angular/common/locales/fr";
import localeAr from "@angular/common/locales/ar";
import localeEs from "@angular/common/locales/es";
import { JugadoresService } from "./services/collections/jugadores.service";
import { JugadoresListComponent } from "./components/jugadores/list/jugadores-list.component";
import { JugadoresAddComponent } from "./components/jugadores/add/jugadores-add.component";
import { PartidosListComponent } from "./components/partidos/list/partidos-list.component";
import { PartidosEditComponent } from "./components/partidos/edit/partidos-edit.component";
import { SearchInputComponent } from "./components/shared/search-input/search.input.component";
import { HttpClientModule } from "@angular/common/http";
import { EntrenamientosService } from "./services/collections/entrenamientos.service";
import { EntrenamientosListComponent } from './components/entrenamientos/list/entrenamientos-list.component';
import { EntrenamientosAddComponent } from './components/entrenamientos/add/entrenamientos-add.component';
import { EntrenamientosEditComponent } from './components/entrenamientos/edit/entrenamientos-edit.component';
import { JugadoresEditComponent } from './components/jugadores/edit/jugadores-edit.component';
import { JugadoresProfileComponent } from "./components/jugadores/profile/jugadores-profile.component";
import { EquiposAddComponent } from './components/equipos/add/equipos-add.component';
import { EquiposEditComponent } from "./components/equipos/edit/equipos-edit.component";
import { EquiposListComponent } from "./components/equipos/list/equipos-list.component";

// import {MatCheckboxModule} from '@angular/material/checkbox';
import { DivisionesListComponent } from './components/divisiones/list/divisiones-list.component';
import { DivisionesService } from "./services/collections/divisiones.service";
import { DivisionesAddComponent } from './components/divisiones/add/divisiones-add.component';
import { DivisionesEditComponent } from "./components/divisiones/edit/divisiones-edit.component";
import { AppComponent } from "./app.component";
// import { AppComponent } from '../../projects/demo/src/app/app.component';
import { BrowserModule } from '@angular/platform-browser';
import { FireAdminComponent } from "./fire-admin.component";


registerLocaleData(localeFr);
registerLocaleData(localeAr);
registerLocaleData(localeEs);

@NgModule({
  declarations: [
    // FireAdminComponent,
    AppComponent,
    FireAdminComponent,
    LoginComponent,
    DashboardComponent,
    SidebarComponent,
    NavbarComponent,
    TranslatePipe,
    FooterComponent,
    DivisionesListComponent,
    DivisionesAddComponent,
    DivisionesEditComponent,
    EquiposListComponent,
    EquiposAddComponent,
    EquiposEditComponent,
    EntrenamientosListComponent,
    EntrenamientosAddComponent,
    EntrenamientosEditComponent,
    PartidosListComponent,
    PartidosAddComponent,
    PartidosEditComponent,
    SettingsComponent,
    LayoutComponent,
    AlertComponent,
    ButtonGroupComponent,
    EscapeUrlPipe,
    UsersListComponent,
    UsersAddComponent,
    // UsersProfileComponent,
    UsersEditComponent,
    JugadoresListComponent,
    JugadoresAddComponent,
    JugadoresEditComponent,
    JugadoresProfileComponent,
    LoadingIndicatorComponent,
    TranslationsComponent,
    // PagesTranslateComponent,
    SearchInputComponent,
    RegisterComponent,
    LogoutComponent,
    ShortDatePipe,
    DateTimePipe,
    TimestampPipe,
    AsistenciaComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FireAdminRoutingModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    // AngularFireModule,
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    DataTablesModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularFireFunctionsModule,
    // FireAdminModule.initialize(environment.firebase)
    // FireAdminModule
  ],
  exports: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    I18nService,
    TranslatePipe,
    AuthService,
    AuthGuard,
    LoginGuard,
    RegisterGuard,
    UserGuard,
    NavigationService,
    AlertService,
    LocalStorageService,
    DivisionesService,
    SettingsService,
    DatabaseService,
    CategoriesService,
    JugadoresService,
    PartidosService,
    EscapeUrlPipe,
    StorageService,
    UsersService,
    EntrenamientosService,
    FirebaseUserService,
    // TranslationsService,
    EquiposService,
    CurrentUserService,
    ConfigService,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    // Set database config (for AngularFireModule)
    // {
    //   provide: FirebaseOptionsToken,
    //   useFactory: FireAdminService.getFirebaseConfig,
    //   deps: [FireAdminService],
    // },
  ],
})

export class AppModule {}

// class FireAdminModule {
//   static initialize(firebaseConfig: FirebaseOptions): ModuleWithProviders {
//     return {
//       ngModule: FireAdminModule,
//       providers: [
//         FireAdminService,
//         {
//           provide: FirebaseOptionsToken,
//           useValue: firebaseConfig,
//         },
//       ],
//     };
//   }
// }
