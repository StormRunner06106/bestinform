import {AfterViewInit, Component, OnInit} from '@angular/core';

import {ActivatedRoute} from "@angular/router";
import { Router } from '@angular/router';
import { ToastService } from 'src/app/shared/_services/toast.service';

import {DatePipe} from "@angular/common";
import { TranslateService } from '@ngx-translate/core';
import {User} from "../../../shared/_models/user.model";
import {Resource} from "../../../shared/_models/resource.model";
import {EditorialsService} from "../_services/editorials.service";
import {Editorial} from "../../../shared/_models/editorial.model";
import {EditorialCategoryModel} from "../_models/editorialCategories.model";




@Component({
  selector: 'app-editorial-view',
  templateUrl: './editorial-view.component.html',
  styleUrls: ['./editorial-view.component.scss'],
  providers: [DatePipe]
})
export class EditorialViewComponent implements OnInit, AfterViewInit {

  //editorial variables
  editorialSlug='';
  contentEditorial:string;
  editorialsList=[];
  edTagList=[];
  edFeaturedImage ='';
  featuredImage ='';
  //edDefaultImage:string='/assets/images/others/Showcase.jpg';
  title:string;
  tags = [];
  category: string;
  publishedDate:string;
  editorialLink:string;
  authorID:string;
  // authorName:any;
  // authorPhoto:any='';
  userData: User;

  //suggested editorials
  page = 0;
  sorting = "date";
  dir = 'asc';
  pageSize= 4;

  currentRoute: string;
  shortDescription: string;

  constructor(private editorialsService: EditorialsService,
    private route: ActivatedRoute,
    private toastService:ToastService,
    private router: Router,
    private datepipe: DatePipe,
    private translate: TranslateService
    ) { }

  ngOnInit(): void {
    this.getPathSlug();
    this.getEditorialsList();
    this.currentRoute= this.router.url;
    console.log(this.currentRoute);
  }

  //get the editorial slug from url
  getPathSlug() {
    this.route.params.subscribe(params => {
      this.editorialSlug = params['slug'];
      //get editorial by slug
      if (this.editorialSlug) {
        this.getEditorialBySlug(this.editorialSlug);
       }
    });
  }

  // getEditorialBySlug(editorialSlug:string){
  //   this.editorialsService.getEditorialBySlug(editorialSlug).subscribe((editorial:object)=>{
  //     this.contentEditorial=editorial["content"];
  //     this.title=editorial["title"];
  //     this.tags=editorial["tags"];
  //     this.category=editorial["category"];
  //     this.publishedDate=editorial["publishedDate"];
  //     this.featuredImage=editorial["featuredImage"]===null ? '../../assets/images/others/images-client/editoriale1.jpg' : editorial["featuredImage"].filePath;
  //     this.authorID=editorial["userId"];
  //     // this.featuredImage=(editorial.featuredImage.filePath==="string" || editorial.featuredImage.filePath===null) ? "/assets/images/others/banner-default-min.jpg" : editorial.featuredImage.filePath
  //     this.getUserById(editorial["userId"]);
  //   });
  // }

  getEditorialBySlug(editorialSlug:string){
    this.editorialsService.getEditorialBySlug(editorialSlug).subscribe((editorial: Editorial)=>{
      this.contentEditorial=editorial.content;
      this.title=editorial.title;
      this.tags=editorial.tags;
      this.publishedDate=editorial.date;
      this.featuredImage=editorial.featuredImage===null ? '../../assets/images/others/images-client/editoriale1.jpg' : editorial["featuredImage"].filePath;
      this.authorID=editorial.userId;
      this.shortDescription=editorial.shortDescription;
      // this.featuredImage=(editorial.featuredImage.filePath==="string" || editorial.featuredImage.filePath===null) ? "/assets/images/others/banner-default-min.jpg" : editorial.featuredImage.filePath
      this.getUserById(editorial.userId);
      this.getCategoryName(editorial.category);
    });
  }

  getUserById(userId:string){
    this.editorialsService.getUserById(userId).subscribe((userData:User)=>{
      console.log('User data, aici:');
      console.log(userData);
      this.userData=userData;
      console.log(userData.firstName, userData.lastName);
    });

  }

  getCategoryName(categoryId:string){
    this.editorialsService.getEditorialCategoriesById(categoryId).subscribe((editorialCategory: EditorialCategoryModel)=>{
      this.category=editorialCategory.name;
    })
  }

  getEditorialsList(){
    //last 5 editorials ?
    //conditie sa nu fie schita...statusul sa fie publicat
    const dateFilterEditorial = {
      status:"Active"
    };


    this.editorialsList=[];
    this.editorialsService.listEditorialFiltered(0, 4,"date", "desc",  dateFilterEditorial).subscribe((editorials: object)=>{
      console.log(editorials);
      editorials["content"].forEach((editorial: Resource)=>{
        this.editorialsList.push({
          imgPath:editorial.featuredImage===null ? "../../assets/images/others/images-client/editoriale1.jpg" : editorial.featuredImage.filePath,
          // imgPath:editorial.featuredImage === null ? editorial.featuredImage.,
          title:editorial.title,
          tags:[editorial.tags],
          author:editorial.authors[0],
          date:editorial.date,
          link:('private/editorials/view/'+ editorial.slug)
        });
      });
    });
  }




  ngAfterViewInit(){
    document.getElementById('preloader').classList.add('hide');
  }


}
