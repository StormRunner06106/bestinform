import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {of} from "rxjs";

@Injectable()

export class FeatureEditorialsContentService {
    constructor(private readonly http: HttpClient) {
    }

    public getEditorialsBySlug(id: any): any {
        // @TODO This http.get is correct, but BE is not ready yet. Use mocks for now
        // return this.http.get('/bestinform/getEditorialBySlug?slug=' + id);

        return of({
                id: "64199da1d4bcff67ed2a2fc6",
                title: "I giardini di Zoe– un colț de rai în jud. Hunedoara",
                category: "Atractii turistice",
                subcategory: "64198aba78035b1c35100f16",
                shortDescription: "Anul trecut în drumul nostru spre Oradea am vizitat o locație de care m-am îndrăgostit pe loc, I giardini di Zoe din Banpotoc, probabil îți amintești articolul din vară și pozele acelea cu mii de trandafiri înfloriți.",
                metaDescription: "",
                metaTitle: "i-giardini-di-zoe",
                tags: ['test tag1', 'test tag2', 'test tag 3'],
                content: "<p>M-am n&#259;scut la sf&#226;r&#537;itul primei luni de prim&#259;var&#259;, exact &#238;n momentul &#238;n care ghioceii &#537;i zambilele fac loc lalelelor &#537;i copacii ne inund&#259; privirile cu milioane de floricele. Parfumul prim&#259;verii este inconfundabil, zeci de miresme ne bucur&#259; sim&#539;urile &#537;i totul revine la via&#539;&#259;.&#160;</p><p>Soarele &#238;ncepe s&#259;-&#537;i fac&#259; sim&#539;it&#259; prezen&#539;a &#537;i temperaturile devin mai bl&#226;nde. Acestea sunt motivele pentru care iubesc at&#226;t de mult prim&#259;vara, nu-i a&#537;a c&#259; este cel mai frumos anotimp?</p><p>&#206;n continuare am s&#259; &#238;&#539;i prezint I giardini di Zoe prin fotografii, sper s&#259; te &#238;nc&#226;nte &#537;i relaxeze la fel de mult ca &#537;i pe mine.</p>",
                featuredImage: {
                    fileName: "Photo_1649789006212.jpg",
                    filePath: "https://dev.bestinform.eu/bestinform/files/editorials/64199da1d4bcff67ed2a2fc6/Photo_1649789006212.jpg"
                },
                slug: "i-giardini-di-zoe–-un-colț-de-rai-în-jud.-hunedoara",
                status: "active",
                userId: "641856a800627e11041bbc91",
                username: "Sirbu Theodora",
                authors: [""],
                date: [2023, 3, 21, 12, 5, 53, 319000000],
                conclusionContent: 'Morbi sed imperdiet in ipsum, adipiscing elit dui lectus. Tellus id scelerisque est ultricies ultricies. Duis est sit sed leo nisl, blandit elit sagittis. Quisque tristique consequat quam sed. Nisl at scelerisque amet nulla purus habitasse.\n' +
                    'Nunc sed faucibus bibendum feugiat sed interdum. Ipsum egestas condimentum mi massa. In tincidunt pharetra consectetur sed duis facilisis metus. Etiam egestas in nec sed et. Quis lobortis at sit dictum eget nibh tortor commodo cursus.\n' +
                    'Odio felis sagittis, morbi feugiat tortor vitae feugiat fusce aliquet. Nam elementum urna nisi aliquet erat dolor enim. Ornare id morbi eget ipsum. Aliquam senectus neque ut id eget consectetur dictum. Donec posuere pharetra odio consequat scelerisque et, nunc tortor. Nulla adipiscing erat a erat. Condimentum lorem posuere gravida enim posuere cursus diam.',

                publishedDate: null,
                singleImageOrder: 5,
                singleImageCaption: "Caption of single image",
                imageGridOrder: 4,
                imageGridDescription: "Elit nisi in eleifend sed nisi. Pulvinar at orci, proin imperdiet commodo consectetur convallis risus. Sed condimentum enim dignissim adipiscing faucibus consequat, urna. Viverra purus et erat auctor aliquam. Risus, volutpat vulputate posuere purus sit congue convallis aliquet. Arcu id augue ut feugiat donec porttitor neque. Mauris, neque ultricies eu vestibulum, bibendum quam lorem id. Dolor lacus, eget nunc lectus in tellus, pharetra, porttitor.",
                carouselDescription: "Elit nisi in eleifend sed nisi. Pulvinar at orci, proin imperdiet commodo consectetur convallis risus. Sed condimentum enim dignissim adipiscing faucibus consequat, urna. Viverra purus et erat auctor aliquam. Risus, volutpat vulputate posuere purus sit congue convallis aliquet. Arcu id augue ut feugiat donec porttitor neque. Mauris, neque ultricies eu vestibulum, bibendum quam lorem id. Dolor lacus, eget nunc lectus in tellus, pharetra, porttitor.",
                carouselOrder: 3,
                singleVideoOrder: 1,
                multipleVideosOrder: 2,
                videosLinks: [
                    'dQw4w9WgXcQ',
                    'dQw4w9WgXcQ',
                    'Zi_XLOBDo_Y',
                    'Zi_XLOBDo_Y',
                    'Zi_XLOBDo_Y',
                    'pVHKp6ffURY',
                    'pVHKp6ffURY',
                    'pVHKp6ffURY',
                    'pVHKp6ffURY',
                ],
            }
        )
    }
}