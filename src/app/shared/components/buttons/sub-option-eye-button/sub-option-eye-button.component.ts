import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CategoriesV2Service } from '../../../categories-v2.service';
import { MenuCategory } from '../../../menu-category';
import { MenuOption } from '../../../menu-option';
import { OptionsService } from '../../../options.service';
import { SubOptionsService } from '../../../sub-options.service';
import { MenuSubOption } from '../../../menu-sub-option';

@Component({
  selector: 'app-sub-option-eye-button',
  templateUrl: './sub-option-eye-button.component.html',
  styleUrls: ['./sub-option-eye-button.component.scss'],
})
export class SubOptionEyeButtonComponent implements OnInit {

  @Input() subOption: MenuSubOption;
  @Output() switch = new EventEmitter<MenuSubOption>();

  constructor(
    private subOptionsService: SubOptionsService,
  ) { }

  ngOnInit() {
  }

  toggle() {
    const subOption = new MenuSubOption({
      id: this.subOption.id,
      enabled: !this.subOption.enabled,
    });
    this.subOptionsService
      .update(subOption)
      .subscribe(
        () => {
          this.subOption.enabled = !this.subOption.enabled;
          this.switch.emit(this.subOption);
        }
      );
  }
}
