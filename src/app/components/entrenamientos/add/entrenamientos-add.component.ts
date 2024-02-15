import { Component, OnInit, AfterViewInit, OnDestroy } from "@angular/core";
import { initTextEditor } from "../../../helpers/posts.helper";
import { I18nService } from "../../../services/i18n.service";
import { SettingsService } from "../../../services/settings.service";
import { slugify } from "../../../helpers/functions.helper";
import { Language } from "../../../models/language.model";
import { CategoriesService } from "../../../services/collections/categories.service";
import { Category } from "../../../models/collections/category.model";
import { Observable, Subject } from "rxjs";
import { map, takeUntil } from "rxjs/operators";
import { AlertService } from "../../../services/alert.service";
// import { PartidosService } from '../../../services/collections/partidos.service';
import { NavigationService } from "../../../services/navigation.service";
import { PartidoStatus } from "../../../models/collections/partido.model";
import { getEmptyImage } from "../../../helpers/assets.helper";
// import { JugadoresService } from '../../../services/collections/jugadores.service';
import { EntrenamientosService } from "../../../services/collections/entrenamientos.service";

@Component({
  selector: "fa-posts-add",
  templateUrl: "./entrenamientos-add.component.html",
  styleUrls: ["./entrenamientos-add.component.css"],
})
export class EntrenamientosAddComponent implements OnInit, OnDestroy {
  title: string = "";
  editor: any;
  private status: PartidoStatus;
  language: string;
  slug: string;
  date: string;
  fecha: any;
  isLoading: any;
  private image: File;
  imageSrc: string | ArrayBuffer;
  categoriesObservable: Observable<Category[]>;
  newCategory: string;
  isSubmitButtonsDisabled: boolean = false;
  private languageChange: Subject<void> = new Subject<void>();

  constructor(
    private i18n: I18nService,
    private settings: SettingsService,
    private alert: AlertService,
    private entrenamientos: EntrenamientosService,
    private navigation: NavigationService
  ) {}

  ngOnInit() {
    this.status = PartidoStatus.Draft;
    this.date = new Date().toISOString().slice(0, 10);
    this.image = null;
    this.imageSrc = getEmptyImage();
  }


  ngOnDestroy() {
    // this.languageChange.next();
  }


  onImageChange(event: Event) {
    this.image = (event.target as HTMLInputElement).files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imageSrc = reader.result;
    };
    reader.readAsDataURL(this.image);
  }

  addEntrenamiento(event: Event, status?: PartidoStatus) {

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
    // Check if post slug is duplicated

    this.entrenamientos
      .add({
        titulo: this.title,
        jugadores: [],
        propiedades: {},
        date: new Date(this.date).getTime(),
        // status: this.status,
      })
      .then((id: string) => {
        this.alert.success(
          "Entrenamiento agregado correctamente!",
          false,
          5000,
          true
        );
        this.navigation.redirectTo("entrenamientos", "edit", id);
      })
      .catch((error: Error) => {
        this.alert.error(error.message);
      })
      .finally(() => {
        stopLoading();
      });
  }

  publishEntrenamiento(event: Event) {
    this.addEntrenamiento(event, PartidoStatus.Published);
  }
}
