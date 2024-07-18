import {Component, Inject, OnInit} from '@angular/core';
import {MenuService} from "../../../../../../_services/menu.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-delete-menu-category',
  templateUrl: './delete-menu-category.component.html',
  styleUrls: ['./delete-menu-category.component.scss']
})
export class DeleteMenuCategoryComponent implements OnInit{

  constructor(private menuService: MenuService,
              public dialogRef: MatDialogRef<DeleteMenuCategoryComponent>,
              @Inject(MAT_DIALOG_DATA) public categoryData: { category }) {
  }

ngOnInit() {
    console.log(this.categoryData)
}

  close(): void {
    this.dialogRef.close();
  }

  deleteCategory(){
    const menuList = this.menuService.menuList$.getValue()

    // Exclude the room by id
    const filteredList = menuList.filter(category => category.id !== this.categoryData.category.id);

    // Check if a room was deleted and update the array
    if (filteredList.length !== menuList.length) {
      this.menuService.menuList$.next(filteredList);
      this.menuService.refreshMenuList$.next(true);
      this.close();
    } else {
      console.log(`Room not found`);

    }
  }
}
