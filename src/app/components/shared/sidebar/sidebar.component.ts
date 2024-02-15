import { Component, OnInit, AfterViewInit, Input } from '@angular/core';
import { NavigationService } from '../../../services/navigation.service';
import { initDropdown, toggleSidebar } from '../../../helpers/layout.helper';
import { getLogo } from '../../../helpers/assets.helper';
import { CurrentUserService } from '../../../services/current-user.service';
import { SidebarItem } from '../../../models/sidebar-item.model';

@Component({
  selector: 'fa-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, AfterViewInit {

  @Input() style: string = 'expanded';
  logo: string = getLogo();
  items: SidebarItem[] = [
    // Dashboard
    {
      label: 'Dashboard',
      icon: '&#xE917;',
      routerLink: this.navigation.getRouterLink('dashboard')
    },
    // Pages
    {
      label: 'Divisiones',
      icon: 'insert_drive_file',
      isHidden: () => !this.currentUser.isAdmin(),
      isActive: this.isActive(['divisiones', 'list'], ['divisiones', 'add'], ['divisiones', 'edit']),
      childrens: [
        {
          label: 'Listado',
          routerLink: this.navigation.getRouterLink('divisiones', 'list')
        },
        {
          label: 'Agregar',
          routerLink: this.navigation.getRouterLink('divisiones', 'add')
        }
      ]
    },
    // Equipos
    {
      label: 'Equipos',
      icon: 'insert_drive_file',
      isActive: this.isActive(['equipos', 'list'], ['equipos', 'add'], ['equipos', 'edit'], ['equipos', 'translate']),
      childrens: [
        {
          label: 'Listado',
          routerLink: this.navigation.getRouterLink('equipos', 'list')
        },
        {
          label: 'Agregar',
          routerLink: this.navigation.getRouterLink('equipos', 'add')
        }
      ]
    },
    // Partidos
    {
      label: 'Partidos',
      icon: 'description',
      isActive: this.isActive(['partidos', 'list'], ['partidos', 'add'], ['partidos', 'edit'], ['partidos', 'translate'], ['partidos', 'categories']),
      childrens: [
        {
          label: 'Listado',
          routerLink: this.navigation.getRouterLink('partidos', 'list')
        },
        {
          label: 'Agregar',
          routerLink: this.navigation.getRouterLink('partidos', 'add')
        }
      ]
    },
    // Partidos
    {
      label: 'Entrenamientos',
      icon: 'description',
      isActive: this.isActive(['entrenamientos', 'list'], ['entrenamientos', 'add'], ['entrenamientos', 'edit'], ['entrenamientos', 'translate'], ['entrenamientos', 'categories']),
      childrens: [
        {
          label: 'Listado',
          routerLink: this.navigation.getRouterLink('entrenamientos', 'list')
        },
        {
          label: 'Agregar',
          routerLink: this.navigation.getRouterLink('entrenamientos', 'add')
        }
      ]
    },
    // Users
    {
      label: 'Usuarios',
      icon: 'person',
      isActive: this.isActive(['users', 'list'], ['users', 'add'], ['users', 'edit'], ['users', 'profile']),
      isHidden: () => !this.currentUser.isAdmin(),
      childrens: [
        {
          label: 'Listado',
          routerLink: this.navigation.getRouterLink('users', 'list')
        },
        {
          label: 'Agregar',
          routerLink: this.navigation.getRouterLink('users', 'add')
        }
      ]
    },
    {
      label: 'Jugadores',
      icon: 'person',
      isActive: this.isActive(['jugadores', 'list'], ['jugadores', 'add'], ['jugadores', 'edit'], ['jugadores', 'profile']),
      // isHidden: () => !this.currentUser.isAdmin(),
      childrens: [
        {
          label: 'Listado',
          routerLink: this.navigation.getRouterLink('jugadores', 'list')
        },
        {
          label: 'Agregar',
          routerLink: this.navigation.getRouterLink('jugadores', 'add')
        }
      ]
    },
    
  ];

  constructor(public navigation: NavigationService, public currentUser: CurrentUserService) { }

  ngOnInit() {
    
  }

  ngAfterViewInit() {
    initDropdown();
  }

  private isRouteActive(...path: string[]) {
    const link = this.navigation.getRouterLink(...path).join('/');
    //console.log(link);
    return this.navigation.router.isActive(link, false);
  }

  private isActive(...routes: any[]) {
    let isActive = false;
    routes.forEach((path: string[]) => {
      if (this.isRouteActive(...path)) {
        isActive = true;
      }
    });
    return isActive;
  }

  toggle() {
    toggleSidebar();
  }

}
