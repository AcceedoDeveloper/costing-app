import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-addgrade',
  templateUrl: './addgrade.component.html',
  styleUrls: ['./addgrade.component.css']
})
export class AddgradeComponent implements OnInit {
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  fruits: string[] = ['Lemon'];
  allFruits: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];
  currentFruit: string = '';
  filteredFruits: string[] = [];

  @ViewChild('fruitInput') fruitInput!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    this.filterFruits();
  }

  filterFruits() {
    const input = this.currentFruit.toLowerCase();
    this.filteredFruits = input
      ? this.allFruits.filter(fruit => fruit.toLowerCase().includes(input) && !this.fruits.includes(fruit))
      : this.allFruits.slice().filter(f => !this.fruits.includes(f));
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.fruits.includes(value)) {
      this.fruits.push(value);
    }
    this.currentFruit = '';
    this.filterFruits();
  }

  remove(fruit: string): void {
    const index = this.fruits.indexOf(fruit);
    if (index >= 0) {
      this.fruits.splice(index, 1);
    }
    this.filterFruits();
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;
    if (!this.fruits.includes(value)) {
      this.fruits.push(value);
    }
    this.currentFruit = '';
    this.fruitInput.nativeElement.value = '';
    this.filterFruits();
  }
}
