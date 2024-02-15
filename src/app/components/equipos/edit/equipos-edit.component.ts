import { Component, OnInit, OnDestroy } from "@angular/core";
import { slugify } from "../../../helpers/functions.helper";
// import { PageBlock, PageBlockType, Page } from '../../../models/collections/page.model';
import { I18nService } from "../../../services/i18n.service";
import { EquiposService } from "../../../services/collections/equipos.service";
import { AlertService } from "../../../services/alert.service";
import { NavigationService } from "../../../services/navigation.service";
import { Subscription, Subject } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { map, take } from "rxjs/operators";
import { Equipo } from "../../../models/collections/equipo.model";
import { DivisionesService } from "src/app/services/collections/divisiones.service";
import { Division } from "src/app/models/collections/division.model";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: "fa-pages-edit",
  templateUrl: "./equipos-edit.component.html",
  styleUrls: ["./equipos-edit.component.css"],
})
export class EquiposEditComponent implements OnInit, OnDestroy {
  private id: string;
  title: string;
  selectedDivision: string;
  divisionesObservable: any;
  isSubmitButtonsDisabled: boolean = false;
  private subscription: Subscription = new Subscription();
  private routeParamsChange: Subject<void> = new Subject<void>();
  equipo: Equipo;

  constructor(
    private i18n: I18nService,
    private equipos: EquiposService,
    private division: DivisionesService,
    private auth: AuthService,
    private alert: AlertService,
    public navigation: NavigationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.isSubmitButtonsDisabled = true;
    this.subscription.add(
      this.route.params.subscribe((params: { id: string }) => {
        // console.log(params);
        this.equipos
          .get(params.id)
          .pipe(take(1))
          .toPromise()
          .then((equipo: Equipo) => {
            // console.log(page);
            if (equipo) {
              this.id = equipo.id;
              this.title = equipo.title;
              this.equipo = equipo;
              this.routeParamsChange.next();
              this.isSubmitButtonsDisabled = false;
            } else {
              this.navigation.redirectTo("equipos", "list");
            }
          });
      })
    );

    this.divisionesObservable = this.division.getAll().pipe(
      map((_equipo: Division[]) => {
        return _equipo.sort(
          (a: Division, b: Division) => b.createdAt - a.createdAt
        );
      })
    );
    this.divisionesObservable.subscribe();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.routeParamsChange.next();
  }

  savePage(event: Event) {
    const target = event.target as any;
    const startLoading = () => {
      target.isLoading = true;
      this.isSubmitButtonsDisabled = true;
    };
    const stopLoading = () => {
      target.isLoading = false;
      this.isSubmitButtonsDisabled = false;
    };

    startLoading();

    // Edit Equipo
    // const data: Equipo = {
    //   title: this.title,
    //   divisionId: this.selectedDivision,
    // };

    let data = this.equipo;
    data.title = this.title;
    data.divisionId = this.selectedDivision;
    data.updatedBy = this.auth.firebaseUser.uid;

    this.equipos
      .edit(this.id, data)
      .then(() => {
        this.alert.success(this.i18n.get("PageSaved"), false, 5000, true);
        this.navigation.redirectTo("equipos", "list");
      })
      .catch((error: Error) => {
        this.alert.error(error.message);
      })
      .finally(() => {
        stopLoading();
      });
  }
}
