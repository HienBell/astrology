/**
 * Vietnamese dictionary. This file is the shape all other locales conform to —
 * `Dictionary` is inferred from it, so adding a key here makes TypeScript
 * demand it everywhere else.
 */

export const vi = {
  meta: {
    title: "Thiên Đồ — Chiêm tinh Vệ Đà",
    description:
      "Lập lá số Jyotish theo hoàng đạo sao thật và đọc vận ngày cho sự nghiệp, tình yêu, gia đình, sức khoẻ, tiền bạc.",
  },

  nav: {
    home: "Trang chủ",
    chart: "Lá số",
    today: "Vận hôm nay",
    about: "Về Jyotish",
    newChart: "Lập lá số mới",
  },

  hero: {
    eyebrow: "Chiêm tinh Vệ Đà · Jyotish",
    title: "Bầu trời lúc bạn chào đời",
    titleAccent: "vẫn đang chuyển động",
    subtitle:
      "Nhập ngày, giờ và nơi sinh. Chúng tôi dựng lá số theo hoàng đạo sao thật, tính chu kỳ Vimshottari Dasha và đọc vận ngày hôm nay cho năm lĩnh vực của đời bạn.",
    cta: "Lập lá số",
    ctaSecondary: "Xem thử một lá số mẫu",
    scrollHint: "Cuộn để bắt đầu",
    stat1: "9 sao",
    stat1Label: "Cửu Diệu",
    stat2: "27 chòm",
    stat2Label: "Nakshatra",
    stat3: "120 năm",
    stat3Label: "Chu kỳ Dasha",
  },

  form: {
    title: "Thông tin sinh",
    subtitle: "Càng chính xác, lá số càng đúng — nhất là giờ sinh.",
    name: "Tên gọi",
    namePlaceholder: "Bạn muốn được gọi là gì?",
    nameHint: "Chỉ dùng để hiển thị, không gửi đi đâu cả.",
    date: "Ngày sinh",
    time: "Giờ sinh",
    timeHint:
      "Lệch 4 phút là cung Mọc đã dịch 1 độ. Nếu không nhớ chính xác, hãy chọn giờ gần đúng nhất.",
    place: "Nơi sinh",
    placePlaceholder: "Nhập tên thành phố…",
    placeHint: "Dùng để xác định múi giờ và toạ độ dựng cung Mọc.",
    searching: "Đang tìm…",
    noResults: "Không tìm thấy địa điểm này",
    searchError: "Không tìm được địa điểm. Kiểm tra kết nối rồi thử lại.",
    timezone: "Múi giờ",
    timezoneOverride: "Đổi múi giờ",
    timezoneHint:
      "Tự động xác định từ toạ độ theo quy tắc lịch sử. Chỉ đổi nếu bạn chắc chắn.",
    submit: "Dựng lá số",
    submitting: "Đang tính toán…",
    required: "Trường này bắt buộc",
    invalidDate: "Ngày không hợp lệ",
    invalidTime: "Giờ không hợp lệ",
    placeRequired: "Hãy chọn một địa điểm từ danh sách gợi ý",
    unknownTime: "Tôi không nhớ giờ sinh",
    unknownTimeNote:
      "Sẽ dùng 12:00 trưa. Cung Mọc và các cung nhà sẽ không đáng tin, nhưng vị trí các sao vẫn đúng.",
  },

  domains: {
    career: "Sự nghiệp",
    love: "Tình yêu",
    family: "Gia đình",
    health: "Sức khoẻ",
    money: "Tiền bạc",
  },

  domainTaglines: {
    career: "Công việc, danh tiếng, hướng đi",
    love: "Bạn đời, tình cảm, kết nối",
    family: "Tổ ấm, cha mẹ, gốc rễ",
    health: "Thân thể, năng lượng, nhịp sống",
    money: "Thu nhập, tài sản, cơ hội",
  },

  reading: {
    todayTitle: "Vận ngày",
    overall: "Tổng quan",
    scoreLabel: "điểm",
    trendRising: "Đang lên",
    trendSteady: "Ổn định",
    trendFalling: "Đang xuống",
    factorsTitle: "Vì sao",
    factorsEmpty: "Hôm nay không có ảnh hưởng nào đáng kể tới lĩnh vực này.",
    whyThisScore: "Cơ sở của điểm số",
    generating: "Đang luận giải…",
    regenerate: "Luận giải lại",
    interpretationTitle: "Lời luận",
    interpretationFallback:
      "Phần luận giải bằng lời hiện chưa khả dụng. Các yếu tố chiêm tinh bên dưới vẫn đầy đủ và chính xác.",
    prevDay: "Hôm trước",
    nextDay: "Hôm sau",
    today: "Hôm nay",
    dateLabel: "Ngày xem",
  },

  chart: {
    title: "Lá số gốc",
    subtitle: "Rashi (D-1) · Hoàng đạo sao thật · Cung nhà trọn dấu",
    lagna: "Cung Mọc",
    lagnaLord: "Chủ tinh cung Mọc",
    ayanamsa: "Ayanamsa (Lahiri)",
    moonSign: "Cung Mặt Trăng",
    sunSign: "Cung Mặt Trời",
    birthMoment: "Thời điểm sinh",
    styleNorth: "Bắc Ấn",
    styleSouth: "Nam Ấn",
    styleWheel: "Vòng tròn",
    houseLabel: "Cung",
    emptyHouse: "Không có sao",
    tableGraha: "Sao",
    tableSign: "Cung",
    tableDegree: "Độ",
    tableHouse: "Nhà",
    tableNakshatra: "Nakshatra",
    tablePada: "Pada",
    tableDignity: "Trạng thái",
    tableStrength: "Lực",
    retrograde: "Nghịch hành",
    combust: "Bị thiêu",
    legend: "Chú giải",
  },

  dasha: {
    title: "Chu kỳ Vimshottari Dasha",
    subtitle: "Hệ thống định thời 120 năm, tính từ chòm sao của Mặt Trăng lúc sinh",
    maha: "Đại vận",
    antar: "Tiểu vận",
    pratyantar: "Tiểu tiểu vận",
    current: "Đang chạy",
    remaining: "Còn lại",
    years: "năm",
    months: "tháng",
    days: "ngày",
    from: "Từ",
    to: "Đến",
  },

  sadeSati: {
    title: "Sade Sati",
    active: "Đang trong Sade Sati",
    inactive: "Không trong Sade Sati",
    rising: "Giai đoạn đầu — Thổ tinh ở cung 12 tính từ Mặt Trăng",
    peak: "Giai đoạn đỉnh — Thổ tinh đi ngay trên Mặt Trăng gốc",
    setting: "Giai đoạn cuối — Thổ tinh ở cung 2 tính từ Mặt Trăng",
    explain:
      "Chu kỳ khoảng 7 năm rưỡi khi Thổ tinh đi qua ba cung quanh Mặt Trăng lúc sinh. Truyền thống xem đây là giai đoạn thử thách và trưởng thành, không phải tai hoạ.",
  },

  panchanga: {
    title: "Panchanga hôm nay",
    tithi: "Tithi",
    paksha: "Paksha",
    shukla: "Thượng huyền (trăng lên)",
    krishna: "Hạ huyền (trăng xuống)",
    moonNakshatra: "Nakshatra của Mặt Trăng",
    moonSign: "Mặt Trăng ở cung",
  },

  grahas: {
    Sun: "Mặt Trời",
    Moon: "Mặt Trăng",
    Mars: "Hoả tinh",
    Mercury: "Thuỷ tinh",
    Jupiter: "Mộc tinh",
    Venus: "Kim tinh",
    Saturn: "Thổ tinh",
    Rahu: "Rahu",
    Ketu: "Ketu",
  },

  grahaSanskrit: {
    Sun: "Surya",
    Moon: "Chandra",
    Mars: "Mangala",
    Mercury: "Budha",
    Jupiter: "Guru",
    Venus: "Shukra",
    Saturn: "Shani",
    Rahu: "Rahu",
    Ketu: "Ketu",
  },

  rashis: [
    "Bạch Dương",
    "Kim Ngưu",
    "Song Tử",
    "Cự Giải",
    "Sư Tử",
    "Xử Nữ",
    "Thiên Bình",
    "Bọ Cạp",
    "Nhân Mã",
    "Ma Kết",
    "Bảo Bình",
    "Song Ngư",
  ],

  dignities: {
    exalted: "Miếu vượng",
    moolatrikona: "Moolatrikona",
    own: "Nhập miếu",
    friend: "Bạn hữu",
    neutral: "Trung tính",
    enemy: "Khắc kỵ",
    debilitated: "Hãm địa",
  },

  bhavas: [
    "Bản thân, thân thể",
    "Tài sản, gia đạo",
    "Anh em, nỗ lực",
    "Tổ ấm, mẹ",
    "Con cái, tình duyên",
    "Bệnh tật, đối thủ",
    "Hôn nhân, đối tác",
    "Biến động, tuổi thọ",
    "Phúc đức, cha",
    "Sự nghiệp, danh vọng",
    "Thu nhập, bằng hữu",
    "Hao tổn, giải thoát",
  ],

  factor: {
    "gochara.favourable":
      "{graha} đang đi qua cung {house} tính từ Mặt Trăng gốc — vị trí thuận theo phép Gochara.",
    "gochara.adverse":
      "{graha} đang ở cung {house} tính từ Mặt Trăng gốc — vị trí không thuận theo phép Gochara.",
    "gochara.obstructed":
      "{graha} ở vị trí vốn thuận, nhưng bị một sao khác chặn (Vedha) nên kết quả bị vô hiệu.",
    "drishti.conjunction":
      "{moving} đang giao hội với {natal} gốc tại nhà {house}.",
    "drishti.aspect": "{moving} đang chiếu (drishti) vào {natal} gốc ở nhà {house}.",
    "dasha.maha":
      "Đại vận {graha} — trong lá số gốc nằm ở nhà {house}, trạng thái {dignity}.",
    "dasha.antar":
      "Tiểu vận {graha} — trong lá số gốc nằm ở nhà {house}, trạng thái {dignity}.",
    "dasha.pratyantar":
      "Tiểu tiểu vận {graha} — trong lá số gốc nằm ở nhà {house}, trạng thái {dignity}.",
    sadeSati: "Đang ở giai đoạn {phase} của Sade Sati.",
    "moon.nakshatra":
      "Mặt Trăng hôm nay ở chòm {nakshatra} (chủ tinh {lord}), rơi vào nhà {house} của bạn.",
  },

  sadeSatiPhase: {
    rising: "đầu",
    peak: "đỉnh",
    setting: "cuối",
  },

  profile: {
    saved: "Hồ sơ đã lưu",
    savedHint: "Lưu trên máy bạn, không gửi lên máy chủ.",
    switch: "Đổi hồ sơ",
    delete: "Xoá",
    deleteConfirm: "Xoá hồ sơ này?",
    empty: "Chưa có hồ sơ nào",
    add: "Thêm hồ sơ",
  },

  about: {
    title: "Vài điều nên biết",
    siderealTitle: "Hoàng đạo sao thật (Sidereal)",
    siderealBody:
      "Jyotish đo vị trí sao theo các chòm sao thật trên bầu trời, không theo điểm xuân phân như chiêm tinh phương Tây. Chênh lệch giữa hai hệ hiện khoảng 24 độ, nên cung Mặt Trời của bạn ở đây thường lùi một cung so với cung bạn vẫn biết. Đó không phải lỗi.",
    housesTitle: "Cung nhà trọn dấu",
    housesBody:
      "Mỗi cung hoàng đạo là trọn một nhà, bắt đầu từ cung Mọc. Đây là cách chia nhà cổ điển của Jyotish và là giả định nền tảng của mọi luật Gochara, Dasha dùng trong ứng dụng này.",
    limitsTitle: "Giới hạn",
    limitsBody:
      "Đây là công cụ để suy ngẫm, không phải để quyết định thay bạn. Điểm số là cách diễn đạt trực quan cho tương quan các yếu tố chiêm tinh — chúng có ý nghĩa khi so sánh giữa các ngày, chứ không phải một phép đo tuyệt đối. Không dùng thay cho tư vấn y tế, pháp lý hay tài chính.",
  },

  common: {
    loading: "Đang tải…",
    error: "Có lỗi xảy ra",
    retry: "Thử lại",
    back: "Quay lại",
    close: "Đóng",
    copy: "Sao chép",
    copied: "Đã sao chép",
    share: "Chia sẻ",
    language: "Ngôn ngữ",
    strong: "Mạnh",
    weak: "Yếu",
  },
};
