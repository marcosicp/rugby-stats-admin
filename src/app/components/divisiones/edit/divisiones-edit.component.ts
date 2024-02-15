import { Component, OnInit, OnDestroy } from "@angular/core";
import { slugify } from "../../../helpers/functions.helper";
import { I18nService } from "../../../services/i18n.service";
import { AlertService } from "../../../services/alert.service";
import { NavigationService } from "../../../services/navigation.service";
import { Subscription, Subject } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { take } from "rxjs/operators";
import { DivisionesService } from "../../../services/collections/divisiones.service";
import { Division } from "../../../models/collections/division.model";

@Component({
  selector: "fa-pages-edit",
  templateUrl: "./divisiones-edit.component.html",
  styleUrls: ["./divisiones-edit.component.css"],
})
export class DivisionesEditComponent implements OnInit, OnDestroy {
  private id: string;
  title: string;
  isSubmitButtonsDisabled: boolean = false;
  private subscription: Subscription = new Subscription();
  private routeParamsChange: Subject<void> = new Subject<void>();
  equipos: string[];

  constructor(
    private i18n: I18nService,
    private divisiones: DivisionesService,
    private alert: AlertService,
    public navigation: NavigationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.isSubmitButtonsDisabled = true;
    this.subscription.add(
      this.route.params.subscribe((params: { id: string }) => {
        // console.log(params);
        this.divisiones
          .get(params.id)
          .pipe(take(1))
          .toPromise()
          .then((division: Division) => {
            // console.log(page);
            if (division) {
              this.id = division.id;
              this.title = division.title;

              this.routeParamsChange.next();
              this.isSubmitButtonsDisabled = false;
            } else {
              this.navigation.redirectTo("divisiones", "list");
            }
          });
      })
    );
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
    // Check if page slug is duplicated
    this.divisiones
      .isSlugDuplicated(this.title, this.id)
      .then((duplicated: boolean) => {
        if (duplicated) {
          // Warn user about page slug
          this.alert.warning(
            this.i18n.get("PageSlugAlreadyExists"),
            false,
            5000
          );
          stopLoading();
        } else {
          // Edit page
          const data: Division = {
            equipos: this.equipos,
            title: this.title,
          };
          this.divisiones
            .edit(this.id, data)
            .then(() => {
              this.alert.success(this.i18n.get("PageSaved"), false, 5000, true);
              this.navigation.redirectTo("divisiones", "list");
            })
            .catch((error: Error) => {
              this.alert.error(error.message);
            })
            .finally(() => {
              stopLoading();
            });
        }
      })
      .catch((error: Error) => {
        this.alert.error(error.message);
        stopLoading();
      });
  }
}
