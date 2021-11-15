const app = {
  data() {
    return {
      scenicSpots: [],
      restaurants: [],
      scenicSpot: {
        Picture: {
          PictureUrl1: ''
        }
      },
      restaurant: {
        Picture: {
          PictureUrl1: ''
        }
      },
      nearby: {
        scenicSpots: [],
        restaurants: [],
        hotels: []
      },
      cityData: [],
      typeData: [
        '藝術人文', '古蹟廟宇', '生態教育', '觀光工廠', '都會公園', '溫泉泡湯', '休閒農業', 
        '美食小吃', '林場', '體育健身', '自然風景', '國家公園','國家風景區', '森林遊樂區'
      ],
      search: {
        area: [],
        type: [],
      },
      menu: {
        area: '依地區',
        type: '依類型',
        price: '依價格'
      },
      api: {
        path: 'https://ptx.transportdata.tw/MOTC/v2/Tourism',
        top: 15
      },
    }
  },
  methods: {
    getAuthorizationHeader() {
      //  填入自己 ID、KEY 開始
      let AppID = 'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF';
      let AppKey = 'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF';
      //  填入自己 ID、KEY 結束
      let GMTString = new Date().toGMTString();
      let ShaObj = new jsSHA('SHA-1', 'TEXT');
      ShaObj.setHMACKey(AppKey, 'TEXT');
      ShaObj.update('x-date: ' + GMTString);
      let HMAC = ShaObj.getHMAC('B64');
      let Authorization = 'hmac username=\"' + AppID + '\", algorithm=\"hmac-sha1\", headers=\"x-date\", signature=\"' + HMAC + '\"';
      return { 'Authorization': Authorization, 'X-Date': GMTString };
    },
    getScenicSpots() {
      const url = `${this.api.path}/ScenicSpot?$filter=Picture/PictureUrl1 ne null &$top=${this.api.top}`;

      axios.get(url, {
        headers: this.getAuthorizationHeader()
      })
      .then((res) => {
        this.scenicSpots = res.data;
      })
      .catch((err) => {
        console.log(err);
      })
    },
    getScenicSpot(id) {
      const url = `${this.api.path}/ScenicSpot?$filter=ID eq '${id}'`;

      axios.get(url, {
        headers: this.getAuthorizationHeader()
      })
      .then((res) => {
        this.scenicSpot = res.data[0];
        this.getNearbyRestaurants(this.scenicSpot.Position.PositionLon, this.scenicSpot.Position.PositionLat);
        this.getNearbyHotels(this.scenicSpot.Position.PositionLon, this.scenicSpot.Position.PositionLat);

        const scenicSpotModal = new bootstrap.Modal(this.$refs.scenicSpotModal);
        scenicSpotModal.show();
      })
      .catch((err) => {
        console.log(err);
      })
    },
    getRestaurants() {
      const url = `${this.api.path}/Restaurant?$filter=Picture/PictureUrl1 ne null &$top=${this.api.top}`;

      axios.get(url, {
        headers: this.getAuthorizationHeader()
      })
      .then((res) => {
        this.restaurants = res.data;
      })
      .catch((err) => {
        console.log(err);
      })
    },
    getRestaurant(id) {
      const url = `${this.api.path}/Restaurant?$filter=ID eq '${id}'`;

      axios.get(url, {
        headers: this.getAuthorizationHeader()
      })
      .then((res) => {
        this.restaurant = res.data[0];
        this.getNearbyScenicSpots(this.restaurant.Position.PositionLon, this.restaurant.Position.PositionLat);
        this.getNearbyHotels(this.restaurant.Position.PositionLon, this.restaurant.Position.PositionLat);

        const restaurantModal = new bootstrap.Modal(this.$refs.restaurantModal);
        restaurantModal.show();
      })
      .catch((err) => {
        console.log(err);
      })
    },
    getNearbyScenicSpots(longitude, latitude)  {
      const url = `${this.api.path}/ScenicSpot?$filter=Picture/PictureUrl1 ne null &$spatialFilter=nearby(${latitude}, ${longitude}, 500)`;

      axios.get(url, {
        headers: this.getAuthorizationHeader()
      })
      .then((res) => {
        this.nearby.scenicSpots = res.data;
      })
      .catch((err) => {
        console.log(err);
      })
    },
    getNearbyRestaurants(longitude, latitude)  {
      const url = `${this.api.path}/Restaurant?$filter=Picture/PictureUrl1 ne null &$spatialFilter=nearby(${latitude}, ${longitude}, 500)`;

      axios.get(url, {
        headers: this.getAuthorizationHeader()
      })
      .then((res) => {
        this.nearby.restaurants = res.data;
      })
      .catch((err) => {
        console.log(err);
      })
    },
    getNearbyHotels(longitude, latitude)  {
      const url = `${this.api.path}/Hotel?$filter=Picture/PictureUrl1 ne null &$spatialFilter=nearby(${latitude}, ${longitude}, 500)`;

      axios.get(url, {
        headers: this.getAuthorizationHeader()
      })
      .then((res) => {
        this.nearby.hotels = res.data;
      })
      .catch((err) => {
        console.log(err);
      })
    },
    getCitys() {
      const url = 'https://gist.motc.gov.tw/gist_api/V3/Map/Basic/City';

      axios.get(url, {
        headers: this.getAuthorizationHeader()
      })
      .then((res) => {
        this.cityData = res.data;
      })
      .catch((err) => {
        console.log(err);
      })
    },
    toggleMenu(item) {
      const collapse = new bootstrap.Collapse(this.$refs[item]);
      collapse.toggle();
    },
    updateMenu(kind, key) {
      switch (kind) {
        case 'area':
          this.menu.area = this.cityData[key].CityName;
          this.search.area.push(this.cityData[key]);
          break;
        case 'type':
          this.menu.type = this.typeData[key];
          this.search.type.push(this.typeData[key]);
          break;
      }
      this.toggleMenu(kind);
    },
    swiperInit() {
      const swiper = new Swiper('.swiper', {
        slidesPerView: 1,
        spaceBetween: 12,
        breakpoints: {
          992: {
            slidesPerView: 2,
            spaceBetween: 32,
            slidesPerGroup: 2,
          },
          1200: {
            slidesPerView: 3,
            spaceBetween: 32,
            slidesPerGroup: 3,
          }
        },
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: '.swiper-button-prev',
        },
      });
    },
  },
  mounted() {
    this.getScenicSpots();
    this.getRestaurants();
    this.getCitys();
    this.swiperInit();
  },
};

Vue.createApp(app).mount('#app');