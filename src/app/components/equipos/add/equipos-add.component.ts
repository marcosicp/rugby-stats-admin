import { Component, OnInit } from '@angular/core';
import { slugify } from '../../../helpers/functions.helper';
import { Language } from '../../../models/language.model';
import { SettingsService } from '../../../services/settings.service';
// import { PageBlock, PageBlockType } from '../../../models/collections/page.model';
import { I18nService } from '../../../services/i18n.service';
import { EquiposService } from '../../../services/collections/equipos.service';
import { AlertService } from '../../../services/alert.service';
import { NavigationService } from '../../../services/navigation.service';
import { map } from 'rxjs/operators';
import { Division } from 'src/app/models/collections/division.model';
import { DivisionesService } from 'src/app/services/collections/divisiones.service';

@Component({
  selector: 'fa-pages-add',
  templateUrl: './equipos-add.component.html',
  styleUrls: ['./equipos-add.component.css']
})
export class EquiposAddComponent implements OnInit {

  title: string;
  selectedDivision: string;

  divisionesObservable: any;

  constructor(
    private settings: SettingsService,
    private i18n: I18nService,
    private equipos: EquiposService,
    private division: DivisionesService,
    private alert: AlertService,
    private navigation: NavigationService
  ) { }

  ngOnInit() {

    this.divisionesObservable = this.division.getAll().pipe(
      map((_equipo: Division[]) => {

        return _equipo.sort(
          (a: Division, b: Division) => b.createdAt - a.createdAt
        );
      })
    );
    this.divisionesObservable.subscribe();
  }

  addEquipo(event: Event) {
    const addButon = event.target as any;
    const startLoading = () => {
      addButon.isLoading = true;
    };
    const stopLoading = () => {
      addButon.isLoading = false;
    };
    debugger;
    startLoading();
        // Add equipo
        this.equipos.add({
          title: this.title,
          divisionId: this.selectedDivision,
          partidos: []
          // slug: this.slug,
        }).then(() => {
          this.alert.success("Equipo agregado correctamente!", false, 5000, true);
          this.navigation.redirectTo('equipos', 'list');
        }).catch((error: Error) => {
          this.alert.error(error.message);
        }).finally(() => {
          stopLoading();
        });
      }

}
