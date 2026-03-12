export const employerStats = [
    { key: 'jobs', label: 'Tin đang tuyển', value: '12' },
    { key: 'candidates', label: 'Ứng viên mới', value: '84' },
    { key: 'interviews', label: 'Lịch phỏng vấn', value: '16' },
    { key: 'messages', label: 'Trao đổi chưa đọc', value: '9' },
]

export const employerJobs = [
    {
        key: 1,
        title: 'Chuyên viên tuyển dụng nội bộ',
        department: 'Phòng tổ chức cán bộ',
        applications: 28,
        status: 'Đang tuyển',
        deadline: '25/03/2026',
    },
    {
        key: 2,
        title: 'Kỹ thuật viên hạ tầng',
        department: 'Phòng CNTT',
        applications: 17,
        status: 'Chờ duyệt',
        deadline: '28/03/2026',
    },
    {
        key: 3,
        title: 'Chuyên viên pháp chế',
        department: 'Phòng tham mưu',
        applications: 11,
        status: 'Đã đóng',
        deadline: '18/03/2026',
    },
]

export const employerCandidates = [
    {
        key: 1,
        name: 'Nguyễn Hoàng Anh',
        position: 'Chuyên viên tuyển dụng nội bộ',
        status: 'Mới nhận',
        stage: 'Sàng lọc hồ sơ',
    },
    {
        key: 2,
        name: 'Trần Minh Khôi',
        position: 'Kỹ thuật viên hạ tầng',
        status: 'Đạt',
        stage: 'Phỏng vấn vòng 1',
    },
    {
        key: 3,
        name: 'Lê Thanh Mai',
        position: 'Chuyên viên pháp chế',
        status: 'Chờ phản hồi',
        stage: 'Đề nghị bổ sung hồ sơ',
    },
]

export const employerInterviews = [
    {
        key: 1,
        candidate: 'Trần Minh Khôi',
        position: 'Kỹ thuật viên hạ tầng',
        time: '13/03/2026 09:00',
        interviewer: 'Hội đồng 01',
    },
    {
        key: 2,
        candidate: 'Phạm Ngọc Hà',
        position: 'Chuyên viên dữ liệu',
        time: '13/03/2026 14:00',
        interviewer: 'Hội đồng 02',
    },
]

export const employerMessages = [
    {
        key: 1,
        title: 'Trao đổi về lịch phỏng vấn',
        target: 'Nguyễn Hoàng Anh',
        status: 'Chưa đọc',
    },
    {
        key: 2,
        title: 'Bổ sung giấy tờ xác minh',
        target: 'Lê Thanh Mai',
        status: 'Đã phản hồi',
    },
]

export const employerProfile = [
    { label: 'Đơn vị', value: 'Công an TP Hà Nội' },
    { label: 'Đầu mối', value: 'Phòng tổ chức cán bộ' },
    { label: 'Email', value: 'tuyendung.hn@congannha.gov.vn' },
    { label: 'Điện thoại', value: '024.3888.1122' },
]
