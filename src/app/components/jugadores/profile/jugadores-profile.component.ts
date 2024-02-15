import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationService } from '../../../services/navigation.service';
// import { User, UserRole } from '../../../models/collections/user.model';
import { ActivatedRoute } from '@angular/router';
// import { UsersService } from '../../../services/collections/users.service';
import { Subscription, Subject, Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { PartidosService } from '../../../services/collections/partidos.service';
// import { Post, PostStatus } from '../../../models/collections/partido.model';
import { Language } from '../../../models/language.model';
import { SettingsService } from '../../../services/settings.service';
import { Category } from '../../../models/collections/category.model';
import { CategoriesService } from '../../../services/collections/categories.service';
import { EquiposService } from '../../../services/collections/equipos.service';
import { CurrentUserService } from '../../../services/current-user.service';
import { Partido, PartidoStatus } from '../../../models/collections/partido.model';
import { JugadoresService } from '../../../services/collections/jugadores.service';
import { Jugador } from '../../../models/collections/jugador.model';
import { convertirMinutosAHorasYMinutos } from 'src/app/helpers/functions.helper';

@Component({
  selector: 'fa-users-profile',
  templateUrl: './jugadores-profile.component.html',
  styleUrls: ['./jugadores-profile.component.css']
})
export class JugadoresProfileComponent implements OnInit, OnDestroy {

  jugador: any;
  allRoles: object = {};
  latestPosts: Observable<Partido[]>;
  postsLanguage: string;
  languages: Language[];
  allPostsStatus: { labels: object, colors: object };
  allPostsCategories: Category[] = [];
  private subscription: Subscription = new Subscription();
  private routeParamsChange: Subject<void> = new Subject<void>();
  private postsLanguageChange: Subject<void> = new Subject<void>();
  statistics: { posts?: number, publishedPosts?: number, comments?: number, pages?: number } = {};

  constructor(
    public navigation: NavigationService,
    private jugadores: JugadoresService,
    private partidos: PartidosService,
    private categories: CategoriesService,
    private settings: SettingsService,
    private route: ActivatedRoute,
    private pages: EquiposService,
    private currentUser: CurrentUserService
  ) { }

  ngOnInit() {
    // Get all roles
    this.allRoles = this.jugadores.getAllRoles();
    // Get languages
    this.languages = this.settings.getActiveSupportedLanguages();
    this.postsLanguage = '*';//this.languages[0].key;
    // Get all posts status
    this.allPostsStatus = this.partidos.getAllStatusWithColors();
    // Get all posts categories
    this.subscription.add(
      this.categories.getAll().pipe(map((categories: Category[]) => {
        const allCategories: Category[] = [];
        categories.forEach((category: Category) => {
          allCategories[category.id] = category;
        });
        return allCategories;
      })).subscribe((categories: Category[]) => {
        // console.log(categories);
        this.allPostsCategories = categories;
      })
    );
    // Get user data
    this.subscription.add(
      this.route.params.subscribe((params: { id: string }) => {
        // console.log(params);
        this.routeParamsChange.next();
        this.postsLanguageChange.next(); // trigger language change too
        this.jugadores.get(params.id).pipe(
          map((user: Jugador) => {
            user.avatar = this.jugadores.getAvatarUrl(user.avatar as string);
            return user;
          }),
          takeUntil(this.routeParamsChange)
        ).subscribe((user: Jugador) => {
          // console.log(user);
          if (user) {
            this.jugador = user;
            this.jugador.id = params.id;
            this.jugador.tiempoJuegoStr = convertirMinutosAHorasYMinutos(this.jugador.tiempoJuego);
            // Get statistics
            this.getStatistics();
            // Get latest posts
            this.getLatestPosts();
          } else {
            this.navigation.redirectTo('jugadores', 'list');
          }
        });
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.routeParamsChange.next();
    this.postsLanguageChange.next();
  }

  private getLatestPosts() {
    this.latestPosts = this.partidos.getWhereFn(ref => {
      let query: any = ref;
      query = query.where('createdBy', '==', this.jugador.id);
      // Filter by lang
      if (this.postsLanguage !== '*') {
        query = query.where('lang', '==', this.postsLanguage);
      }
      // orderBy & limit requires a database index to work with the where condition above
      // as a workaround, they were replaced with client side sort/slice functions below
      // query = query.orderBy('createdAt', 'desc');
      // query = query.limit(5);
      return query;
    }, true).pipe(
      map((posts: Partido[]) => {
        // console.log(posts);
        return posts.sort((a: Partido, b: Partido) => b.createdAt - a.createdAt).slice(0, 5);
      }),
      takeUntil(this.postsLanguageChange)
    );
  }

  onPostsLanguageChange() {
    this.postsLanguageChange.next();
    this.getLatestPosts();
  }

  private async getStatistics() {
    if (this.jugador && this.jugador.id) {
      this.statistics.posts = await this.partidos.countWhere('createdBy', '==', this.jugador.id);
      const publishedPosts = await this.partidos.countWhereFn(ref => ref.where('createdBy', '==', this.jugador.id).where('status', '==', PartidoStatus.Published));
      this.statistics.publishedPosts = Math.round((publishedPosts / this.statistics.posts) * 100);
      this.statistics.comments = 0; // ToDo
      this.statistics.pages = await this.pages.countWhere('createdBy', '==', this.jugador.id);
    }
  }

  canEditProfile() {
    return !this.currentUser.isGuest();
  }

}
