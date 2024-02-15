import { Component, OnInit, OnDestroy } from "@angular/core";
import { PartidosService } from "../../services/collections/partidos.service";
import { EquiposService } from "../../services/collections/equipos.service";
import { UsersService } from "../../services/collections/users.service";
// import { TranslationsService } from '../../services/collections/translations.service';
import { Observable, Subscription, Subject } from "rxjs";
// import { Post, PostStatus, Partido } from '../../models/collections/partido.model';
import { Language } from "../../models/language.model";
import { Category } from "../../models/collections/category.model";
import { SettingsService } from "../../services/settings.service";
import { CategoriesService } from "../../services/collections/categories.service";
import { map, takeUntil } from "rxjs/operators";
import { NavigationService } from "../../services/navigation.service";
import { initPieChart } from "../../helpers/charts-pie.helper";
import { I18nService } from "../../services/i18n.service";
import { CurrentUserService } from "../../services/current-user.service";
import { Partido, PartidoStatus } from "../../models/collections/partido.model";
import { JugadoresService } from "../../services/collections/jugadores.service";
import { EntrenamientosService } from "../../services/collections/entrenamientos.service";
import { Jugador, JugadorStatus } from "../../models/collections/jugador.model";
import { initBarColumnChart } from "src/app/helpers/charts-bar-colum.helper";
import { convertirMinutosAHorasYMinutos } from "src/app/helpers/functions.helper";

type PostByStatus = {
  label: string;
  count: number;
  //percentage: number
};

@Component({
  selector: "fa-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit, OnDestroy {
  statistics: {
    partidos?: number;
    partidosGanados?: any;
    partidosPerdidos?: number;
    equipos?: number;
    entrenamientos?: number;
    users?: number;
    jugadores?: number;
    jugadoresLesionados?: number;
  } = {};
  latestJugadores: Observable<
    void | Partido[] | { jugadoresTarjetas: any; jugadoresTiempos: any }
  >;
  postsLanguage: string;
  jugadoresByStatus: Observable<PostByStatus[]>;
  postsByStatusLanguage: string;
  languages: Language[];
  allPostsStatus: { labels: object; colors: object };
  allPostsCategories: Category[] = [];
  private subscription: Subscription = new Subscription();
  private postsLanguageChange: Subject<void> = new Subject<void>();
  private postsByStatusLanguageChange: Subject<void> = new Subject<void>();
  // partidosStats: Observable<Partido[]>;
  misJugadores: any[];
  partidosStats: Partido[];
  allPartidos: Subscription;

  // allPartidos: Observable<void>;
  // allPartidos: Observable<any[]>;
  // partidosStats: Promise<void>;
  // partidosStats: Observable<void>;

  constructor(
    private jugadores: JugadoresService,
    private partidos: PartidosService,
    private users: UsersService,
    private entrenamientos: EntrenamientosService,
    private equipos: EquiposService,
    private categories: CategoriesService,
    private settings: SettingsService,
    public navigation: NavigationService,
    public currentUser: CurrentUserService,
    private i18n: I18nService
  ) {}

  ngOnInit() {
    // Get statistics
    this.getStatistics();

    this.postsLanguage = "*"; //this.languages[0].key;
    this.postsByStatusLanguage = "*"; //this.languages[0].key;
    // Get all posts status
    this.allPostsStatus = this.partidos.getAllStatusWithColors();
    // Get all posts categories
    this.subscription.add(
      this.categories
        .getAll()
        .pipe(
          map((categories: Category[]) => {
            const allCategories: Category[] = [];
            categories.forEach((category: Category) => {
              allCategories[category.id] = category;
            });
            return allCategories;
          })
        )
        .subscribe((categories: Category[]) => {
          // console.log(categories);
          this.allPostsCategories = categories;
        })
    );
    // Get latest posts
    this.getLatestMinutesJugadores();

  }

  countPartidos(partidos: Partido[]): any {
    const partidoCounts: any = {};

    for (const partido of partidos) {
      const { nombreEquipo, resultado, resultadoRival } = partido; // Updated property name

      if (!partidoCounts[nombreEquipo]) {
        partidoCounts[nombreEquipo] = { won: 0, lost: 0 };
      }

      if (Number(resultado) > Number(resultadoRival)) {
        // Updated property name
        partidoCounts[nombreEquipo].won++;
      } else if (Number(resultado) < Number(resultadoRival)) {
        // Updated property name
        console.log(nombreEquipo + " error");
        partidoCounts[nombreEquipo].lost++;
      }
    }

    return partidoCounts;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.postsLanguageChange.next();
    this.postsByStatusLanguageChange.next();
  }

  private async getStatistics() {
    this.statistics.partidos = await this.partidos.countAll();
    this.statistics.jugadores = await this.jugadores.countAll();
    this.statistics.jugadoresLesionados = await this.jugadores.countWhereFn(
      (ref) => ref.where("lesionado", "==", true)
    );
    this.statistics.entrenamientos = await this.entrenamientos.countAll();

    if (this.currentUser.isAdmin()) {
      this.statistics.users = await this.users.countAll();
    }
  }

  private getLatestMinutesJugadores() {
    let allJugadores = [];
    // GRILLA ULTIMOS JUGADORES
    this.latestJugadores = this.partidos.getAll().pipe(
      map((partidos: any[]) => {
        this.statistics.partidosGanados = this.countPartidos(partidos);
        let partidosAmarillas = partidos;
        
        for (let i in partidosAmarillas) {
          allJugadores = allJugadores.concat(partidosAmarillas[i].jugadores);
        }

        let playerCardsSum = allJugadores.reduce((acc: any[], jugador: any) => {
          const existingPlayer = acc.find(
            (item) => item.nombre === `${jugador.firstName} ${jugador.lastName}`
          );

          if (existingPlayer) {
            existingPlayer.tarjetas += Number(jugador.amarilla);
            existingPlayer.tiempoJuegoStr = convertirMinutosAHorasYMinutos(
              Number(jugador.tiempoJuego)
            );
          } else {
            acc.push({
              nombre: `${jugador.firstName} ${jugador.lastName}`,
              tiempoJuego:
                jugador.tiempoJuego !== null ? Number(jugador.tiempoJuego) : 0,
              tiempoJuegoStr:
                jugador.tiempoJuego !== null
                  ? convertirMinutosAHorasYMinutos(Number(jugador.tiempoJuego))
                  : "",
              tarjetas:
                jugador.amarilla !== null ? Number(jugador.amarilla) : 0,
            });
          }

          return acc;
        }, []);

        // debugger;
        const labels = playerCardsSum.map((player: any) => player.nombre);

        setTimeout(() => {
          // debugger;
          // setTimeout used to wait for canvas html element to render
          // initPieChart("#posts-by-status", data, labels);
          initBarColumnChart("#posts-by-statuss", labels, playerCardsSum);
        }, 0);
        playerCardsSum.sort((a, b) => b.tarjetas - a.tarjetas);
        return {
          jugadoresTarjetas: playerCardsSum.sort(
            (a, b) => b.tarjetas - a.tarjetas
          ),
          jugadoresTiempos: playerCardsSum.sort(
            (a, b) => b.tiempoJuego - a.tiempoJuego
          ),
        };
      }),
      takeUntil(this.postsLanguageChange)
    );
  }

 
}
