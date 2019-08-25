import {Component, OnInit} from '@angular/core';
import * as compromise from 'compromise';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Sentiment Analysis';
  inputText: string;
  posArry: any;
  negArry: any;
  neuArry: any;
  nlp = compromise;
  wordValues: any;
  overall = '';
  overallColor = 'rgb(247,247,247)';

  constructor(private httpService: HttpClient) {
  }

  ngOnInit() {
    this.getWordValues();
  }

  analyze() {
    if (this.inputText.length > 0 && this.inputText != null) {
      this.posArry = new Array();
      this.negArry = new Array();
      this.neuArry = new Array();
      let posCount = 0;
      let negCount = 0;

      this.lemmatize(this.inputText).forEach(word => {
        if (this.wordValues.hasOwnProperty(word)) { // is word in wordvalues
          if (this.wordValues[word] > 0) {
            this.posArry.push(word + ' +' + this.wordValues[word] + '\n');
            posCount += this.wordValues[word];
          } else {
            this.negArry.push(word + ' ' + this.wordValues[word] + '\n');
            negCount += this.wordValues[word];
          }
        } else {
          this.neuArry.push(word + '\n');
        }
      });

      if (posCount > Math.abs(negCount)) {
        this.overall = 'Positive!' + ' ' + (posCount + negCount);
        this.overallColor = 'rgb(222,255,221)';
      } else if (posCount === Math.abs(negCount)) {
        this.overall = 'Neutral';
        this.overallColor = 'rgb(247,247,247)';
      } else {
        this.overall = 'Negative!' + ' ' + (posCount + negCount);
        this.overallColor = 'rgb(252,238,237)';
      }
    } else { // there is no text, reset everything
      this.overall = '';
      this.overallColor = 'rgb(247,247,247)';
      this.posArry = new Array();
      this.negArry = new Array();
      this.neuArry = new Array();
    }
  }

  lemmatize(input) {
    const doc = this.nlp(input);
    doc.verbs().toInfinitive();
    doc.nouns().toSingular();
    const lemmArray = doc.out('root').split(' ');
    return lemmArray;
  }

  getWordValues() {
    // this seems to be the easiest way to read a file in angular
    this.httpService.get('./assets/AFINN-en-165.csv', {responseType: 'text'}).subscribe(
      data => {
        const textBlob = data as string;
        this.wordValues = this.csvToArray(textBlob);
        // console.log(this.wordValues);
      }
    );
  }

  csvToArray(csvString) {
    let array: { [key: string]: number }; // key value pair
    array = {};
    const lines = csvString.split('\n');
    lines.forEach(line => {
      const lineData = line.split(',');
      array[lineData[0]] = parseInt(lineData[1], 10);
    });

    return array;
  }

}
