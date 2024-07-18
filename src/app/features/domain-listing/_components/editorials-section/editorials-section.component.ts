import { Component, OnInit } from '@angular/core';
import {Resource} from "../../../../shared/_models/resource.model";
import {EditorialsService} from "../../../editorials/_services/editorials.service";

@Component({
  selector: 'app-editorials-section',
  templateUrl: './editorials-section.component.html',
  styleUrls: ['./editorials-section.component.scss']
})
export class EditorialsSectionComponent implements OnInit {

  editorials: Array<object>;


  constructor(private editorialService:EditorialsService) { }

  ngOnInit(): void {
    this.editorials=[];
    this.editorialService.listEditorialFiltered(0,4,"date","asc",{}).subscribe((editorials: object)=>{
      console.log('editorial',editorials);

      editorials["content"].forEach((editorial: Resource)=>{
        console.log(editorial.featuredImage);
        this.editorials.push({
          imgPath:(editorial.featuredImage.filePath==="string" || editorial.featuredImage.filePath===null) ? "../../assets/images/others/images-client/editoriale1.jpg" : editorial.featuredImage.filePath,
          title:editorial.title,
          tags:[editorial.tags],
          author:editorial.authors[0],
          date:editorial.date});
      })

      console.log("array",this.editorials);
    })
  }

}
