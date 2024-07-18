import {Component, Input, OnInit} from "@angular/core";

@Component({
  selector: "app-restaurant-menu",
  templateUrl: "./restaurant-menu.component.html",
  styleUrls: ["./restaurant-menu.component.scss"],
})
export class RestaurantMenuComponent implements OnInit {
  @Input() menu;

  stateOptions: any[] = [
    { label: "Aperetive", value: "aperetive" },
    { label: "Fel Principal", value: "felprincipal" },
    { label: "Bauturi", value: "bauturi" },
    { label: "Vinuri", value: "vinuri" },
    { label: "Desert", value: "desert" },
  ];

  categories = [];

  value = "off";
  items = [];

  originalItems = [];
  filterClicked($event) {
    const selectedCategory = $event.option.value;
    if (selectedCategory === 'all') { // Assuming 'all' is a special case to show all items
      this.items = [...this.originalItems];
    } else {
      this.items = this.originalItems.filter(item => item.category === selectedCategory);
    }
  }




  ngOnInit() {
    // console.log("this.menu", this.menu);
    if (this.menu) {
      console.log(this.menu);
      this.categories = this.menu.map(item => ({
        label: item.categoryName,
        value: item.categoryName,
      }));
  
      this.originalItems = this.menu.flatMap(category => 
        category.items.map(item => ({
          price: item.price,
          name: item.name,
          description: item.description,
          category: category.categoryName, // Add this line to store category info
          image: item.imageUrl,
          currency: item.currency,

        }))
      );

      this.items = [...this.originalItems]; // Initially display all items
      console.log(this.items)
    }
  }
}
