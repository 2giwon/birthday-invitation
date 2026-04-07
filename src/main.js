import "./style.css";

// Fade-in animation using IntersectionObserver
function initFadeIn() {
  const sections = document.querySelectorAll("[data-section]");

  if (!("IntersectionObserver" in window)) {
    // Fallback: show all sections immediately if IntersectionObserver is not supported
    sections.forEach((section) => {
      section.classList.add("visible");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    },
  );

  sections.forEach((section) => {
    // Hero section is always visible
    if (section.dataset.section === "hero") {
      section.classList.add("visible");
      return;
    }
    observer.observe(section);
  });
}

// Kakao Map initialization
function initKakaoMaps() {
  if (typeof kakao === "undefined" || !kakao.maps) return;

  kakao.maps.load(function () {
    // 집합 장소: 서울시 강서구 양천로 62길 41
    var gatheringContainer = document.getElementById("map-gathering");
    if (gatheringContainer) {
      var geocoder = new kakao.maps.services.Geocoder();
      geocoder.addressSearch(
        "서울시 강서구 양천로 62길 41",
        function (result, status) {
          if (status === kakao.maps.services.Status.OK) {
            var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
            var map = new kakao.maps.Map(gatheringContainer, {
              center: coords,
              level: 4,
            });
            var marker = new kakao.maps.Marker({ position: coords });
            marker.setMap(map);
          } else {
            // 주소 검색 실패 시 기본 좌표 사용
            var map = new kakao.maps.Map(gatheringContainer, {
              center: new kakao.maps.LatLng(37.5604, 126.8543),
              level: 4,
            });
          }
        },
      );
    }

    // 파티 장소: 경기 고양시 일산서구 한류월드로 300 원마운트
    var venueContainer = document.getElementById("map-venue");
    if (venueContainer) {
      var geocoder2 = new kakao.maps.services.Geocoder();
      geocoder2.addressSearch(
        "경기 고양시 일산서구 한류월드로 300",
        function (result, status) {
          if (status === kakao.maps.services.Status.OK) {
            var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
            var map = new kakao.maps.Map(venueContainer, {
              center: coords,
              level: 4,
            });
            var marker = new kakao.maps.Marker({ position: coords });
            marker.setMap(map);
          } else {
            // 주소 검색 실패 시 기본 좌표 사용
            var map = new kakao.maps.Map(venueContainer, {
              center: new kakao.maps.LatLng(37.6594, 126.7506),
              level: 4,
            });
          }
        },
      );
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initFadeIn();
  initKakaoMaps();
});
