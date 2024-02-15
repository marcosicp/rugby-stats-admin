import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
// import { User } from '../../../models/collections/user.model';
import { DataTableDirective } from 'angular-datatables';
import { UsersService } from '../../../services/collections/users.service';
import { AlertService } from '../../../services/alert.service';
import { I18nService } from '../../../services/i18n.service';
import { ActivatedRoute } from '@angular/router';
import { NavigationService } from '../../../services/navigation.service';
import { map, takeUntil, skip } from 'rxjs/operators';
import { refreshDataTable } from '../../../helpers/datatables.helper';
import { CurrentUserService } from '../../../services/current-user.service';
import { User } from 'firebase';
import { Jugador } from '../../../models/collections/jugador.model';
import { JugadoresService } from '../../../services/collections/jugadores.service';
import { convertirMinutosAHorasYMinutos } from 'src/app/helpers/functions.helper';

@Component({
  selector: 'fa-jugadores-list',
  templateUrl: './jugadores-list.component.html',
  styleUrls: ['./jugadores-list.component.css']
})
export class JugadoresListComponent implements OnInit, OnDestroy {

  allJugadores: Observable<Jugador[]>;
  selectedUser: Jugador = null;
  @ViewChild(DataTableDirective, {static : false}) private dataTableElement: DataTableDirective;
  dataTableOptions: DataTables.Settings|any = {
    responsive: true,
    aaSorting: []
  };
  dataTableTrigger: Subject<void> = new Subject();
  private subscription: Subscription = new Subscription();
  allRoles: object|any = {};
  private routeParamsChange: Subject<void> = new Subject<void>();
  isLoading: boolean = true;

  constructor(
    private users: JugadoresService,
    private alert: AlertService,
    private i18n: I18nService,
    private route: ActivatedRoute,
    private currentUser: CurrentUserService,
    public navigation: NavigationService
  ) { }

  ngOnInit() {
    // Get all roles
    this.allRoles = this.users.getAllRoles();
    // Get route params
    this.subscription.add(
      this.route.params.subscribe((params: { role: string }) => {
        this.routeParamsChange.next();
        this.isLoading = true;
        // Get all users
        this.allJugadores = this.users.getAll().pipe(
          //skip(this.currentUser.data ? 1 : 0), // workaround to skip first emitted value when currentUser subscription is running (not working when we only have 1 user)
          map((jugador: Jugador[]) => {
           
            // Filter by role
            if (params.role) {
              jugador = jugador.filter((user: Jugador) => user.role === params.role);
            }
            // Get avatar & creator
            jugador.forEach((user: any) => {
              user.avatar = {
                path: user.avatar, // we need to keep track of avatar path for delete purpose
                url: this.users.getAvatarUrl(user.avatar as string)
              };
              user.tiempoJuegoStr = convertirMinutosAHorasYMinutos(user.tiempoJuego);
              if (user.createdBy) {
                user.creator = this.users.getFullName(user.createdBy);
              }
            });
            return jugador.sort((a: Jugador, b: Jugador) => a.lastName.localeCompare(b.lastName));
          }),
          takeUntil(this.routeParamsChange)
        );
        this.subscription.add(
          this.allJugadores.subscribe((users: Jugador[]) => {
            // console.log(users);
            // Refresh datatable on data change
            refreshDataTable(this.dataTableElement, this.dataTableTrigger);
            this.isLoading = false;
          })
        );
      })
    );
  }

  ngOnDestroy() {
    this.dataTableTrigger.unsubscribe();
    this.subscription.unsubscribe();
    this.routeParamsChange.next();
  }

  deleteUser(user: Jugador) {
    this.users.delete(user.id, {
      email: user.email,
      // password: user.password,
      avatar: (user.avatar as any).path
    }).then(() => {
      this.alert.success(this.i18n.get('UserDeleted', { name: `${user.firstName} ${user.lastName}` }), false, 5000);
    }).catch((error: Error) => {
      this.alert.error(error.message);
    });
  }

}
