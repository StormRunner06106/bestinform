import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-toggle-sections',
  templateUrl: './toggle-sections.component.html',
  styleUrls: ['./toggle-sections.component.scss']
})
export class ToggleSectionsComponent implements OnInit {
  

  tabIndex : Tabs = Tabs.tabExplore;
  ngOnInit(): void {
    this.setTab(Tabs.tabExplore);
  }

  setTab(tab:Tabs){
    this.tabIndex=tab;
  }
  onValChange(value){

    console.log('toggle',value);
  }



}
enum Tabs{
  tabEvents = 0,
  tabExplore = 1,
  tabEditorials = 2
}
