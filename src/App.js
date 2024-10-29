import React, { useState } from 'react';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import './App.css';
import templateFile from './template.docx'; // Đảm bảo template.docx nằm trong thư mục src

function App() {
    const [numbers, setNumbers] = useState([]);
    const [selectedNumber, setSelectedNumber] = useState(null);
    const [limit, setLimit] = useState(0);
    const [classSelected, setClassSelected] = useState('');
    const [subjectSelected, setSubjectSelected] = useState('');
    const [semesterSelected, setSemesterSelected] = useState('');
    const [fullName, setFullName] = useState('');

    const classes = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);
    const subjects = ['Toán', 'Văn', 'Tiếng Anh', 'Hóa học', 'Sinh học', 'Lịch sử', 'Địa lý', 'Giáo dục công dân', 'Tin học', 'Thể dục', 'Âm nhạc', 'Mỹ thuật', 'Công nghệ'];
    const semesters = ['Giữa kỳ 1', 'Cuối kỳ 1', 'Giữa kỳ 2', 'Cuối kỳ 2'];

    const setLimitHandler = () => {
        const limitValue = parseInt(document.getElementById('limitInput').value);
        if (!isNaN(limitValue) && limitValue > 0) {
            const newNumbers = Array.from({ length: limitValue }, (_, i) => ({
                value: i + 1,
                status: ''
            }));
            setNumbers(newNumbers);
            setLimit(limitValue);
        }
    };

    const randomNumber = () => {
      const availableNumbers = numbers.filter(num => num.status === '');
      if (availableNumbers.length === 0) {
          document.getElementById('result').textContent = "Hết"; // Hiện từ "Hết" khi không còn số
          document.getElementById('ratingButtons').style.display = 'none';
          return;
      }
      
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      const randomNum = availableNumbers[randomIndex];
      setSelectedNumber(randomNum);
      document.getElementById('result').textContent = `Số: ${randomNum.value}`;
      document.getElementById('ratingButtons').style.display = 'block';
  };

    const correctHandler = () => {
        if (selectedNumber) {
            setNumbers(prevNumbers =>
                prevNumbers.map(num =>
                    num.value === selectedNumber.value ? { ...num, status: 'Đúng' } : num
                )
            );
            randomNumber(); 
        }
    };

    const incorrectHandler = () => {
        if (selectedNumber) {
            setNumbers(prevNumbers =>
                prevNumbers.map(num =>
                    num.value === selectedNumber.value ? { ...num, status: 'Sai' } : num
                )
            );
            randomNumber();
        }
    };

    const updateNumberTable = () => {
        return (
            <tbody>
                {numbers.map((numObj) => (
                    <tr key={numObj.value}>
                        <td>{numObj.value}</td>
                        <td className={numObj.status === "Đúng" ? 'correct-status' : numObj.status === "Sai" ? 'incorrect-status' : ''}>
                            {numObj.status}
                        </td>
                    </tr>
                ))}
            </tbody>
        );
    };

    const exportToDocx = async () => {
        try {
            const response = await fetch(templateFile);
            const arrayBuffer = await response.arrayBuffer();
            const zip = new PizZip(arrayBuffer);
            const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

            doc.setData({
                classSelected,
                subjectSelected,
                semesterSelected,
                fullName,
                table: numbers.map(num => ({ value: num.value, status: num.status }))
            });

            doc.render();
            const out = doc.getZip().generate({ type: 'blob' });
            saveAs(out, 'KetQuaDanhGia.docx');
        } catch (error) {
            console.error('Error exporting to docx:', error);
        }
    };

    return (
        <div className="container">
            <h1>Random câu hỏi trắc nghiệm</h1>
            <p>Người làm: Đinh Văn Hoàng Lân</p>
            <div className="flex-container">
                <div className="input-section">
                    <input type="number" id="limitInput" placeholder="Nhập giới hạn số..." className="input-number" />
                    <button className="btn" onClick={setLimitHandler}>Thiết lập giới hạn</button>
                    <p id="result">Chưa có dữ liệu</p>
                    <button id="randomButton" className="btn" onClick={randomNumber}>Random Số</button>
                    <div id="ratingButtons" style={{ display: 'none' }}>
                        <button className="btn" id="correctButton" onClick={correctHandler}>Đúng</button>
                        <button className="btn" id="incorrectButton" onClick={incorrectHandler}>Sai</button>
                    </div>

                    <label htmlFor="class">Chọn lớp:</label>
                    <select id="class" className="input-number" onChange={(e) => setClassSelected(e.target.value)}>
                        <option value="">Chọn lớp</option>
                        {classes.map((className) => (
                            <option key={className} value={className}>{className}</option>
                        ))}
                    </select>

                    <label htmlFor="subject">Chọn môn học:</label>
                    <select id="subject" className="input-number" onChange={(e) => setSubjectSelected(e.target.value)}>
                        <option value="">Chọn môn học</option>
                        {subjects.map((subject) => (
                            <option key={subject} value={subject}>{subject}</option>
                        ))}
                    </select>

                    <label htmlFor="semester">Chọn kỳ học:</label>
                    <select id="semester" className="input-number" onChange={(e) => setSemesterSelected(e.target.value)}>
                        <option value="">Chọn kỳ học</option>
                        {semesters.map((semester) => (
                            <option key={semester} value={semester}>{semester}</option>
                        ))}
                    </select>

                    <input type="text" id="fullname" placeholder="Nhập họ và tên..." className="input-number" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    <button className="btn" onClick={exportToDocx}>Lưu Kết Quả</button>
                </div>

                <div className="table-section">
                    <table id="numberTable">
                        <thead>
                            <tr>
                                <th>Số</th>
                                <th>Đánh giá</th>
                            </tr>
                        </thead>
                        {updateNumberTable()}
                    </table>
                </div>
            </div>
        </div>
    );
}

export default App;
