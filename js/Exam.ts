import {HtmlCompatActivity} from "./core/HtmlCompatActivity";
import {ExamCallback, ExamHelper} from "./helper/ExamHelper";
import {CurlToolException} from "./core/CurlUnit";
import {ExamData} from "./data/ExamData";

export class Exam extends HtmlCompatActivity implements ExamCallback {
    public onCreate() {
        const exam = localStorage.getItem("cache.exam");
        if (exam != null){
            ExamHelper.parse(exam, this);
        } else {
            this.getExam();
        }
    }

    public getExam(){
        new ExamHelper().getExamInfo(this);
    }

    onReadStart() {
        const items: HTMLCollectionOf<Element> = document
            .getElementsByClassName("exam-item");
        for (let i: number = 0; i < items.length; i++){
            items.item(i).remove();
        }
    }

    onFailure(code: number, message?: string, e?: CurlToolException) {
        // @ts-ignore
        mdui.snackbar({
            message: '考试座位安排获取失败，' + message + '(' + code.toString() + ')'
        })
    }

    onReadData(data: ExamData) {
        const exam: Element = document.getElementById("exam-content");

        const exam_item: Element = document.createElement('div');
        exam_item.classList.add('table-content', 'exam-column', 'exam-item');
        const content_item: Element = document.createElement('p');
        content_item.classList.add('table-item-title');
        content_item.textContent = data.name;
        exam_item.appendChild(content_item);

        content_item.classList.remove('table-item-title');
        content_item.classList.add('table-item-content');
        content_item.textContent = data.time;
        exam_item.appendChild(content_item);

        content_item.textContent = data.location;
        exam_item.appendChild(content_item);

        content_item.textContent = data.set;
        exam_item.appendChild(content_item);

        exam.appendChild(exam_item);
    }

    onReadFinish(isEmpty: boolean) {
        Exam.setVisibility(document.getElementById("exam-empty"), isEmpty);
    }
}