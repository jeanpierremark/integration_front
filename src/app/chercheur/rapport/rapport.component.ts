import { Component } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ReportSection {
  id: number;
  title: string;
  content: string;
  type: 'text' | 'chart' | 'image';
  chartData?: {
    type: string;
    title: string;
    data: any[];
  };
}

export interface Report {
  title: string;
  subtitle: string;
  author: string;
  date: string;
  location: string;
  period: {
    start: string;
    end: string;
  };
  executive_summary: string;
  sections: ReportSection[];
}

@Component({
  selector: 'app-rapport',
  templateUrl: './rapport.component.html',
  styleUrls: ['./rapport.component.css']
})
export class RapportComponent {
  user: string = sessionStorage.getItem('prenom')+' '+sessionStorage.getItem('nom') || '';

  report: Report = {
    title: '',
    subtitle: '',
    author: this.user,
    date: new Date().toISOString().split('T')[0],
    location: '',
    period: { start: '', end: '' },
    executive_summary: '',
    sections: [
      { id: 1, title: 'Introduction', content: '', type: 'text' }
    ]
  };

  activeSection: number = 1;
  previewMode: boolean = false;

  chartTypes = [
    { value: 'temperature', label: 'Évolution des Températures' },
    { value: 'precipitation', label: 'Précipitations' },
    { value: 'humidity', label: 'Humidité' },
    { value: 'wind', label: 'Vitesse du Vent' }
  ];

  addSection(type: 'text' | 'chart' | 'image' = 'text'): void {
    const newSection: ReportSection = {
      id: Date.now(),
      title: `Nouvelle Section ${this.report.sections.length + 1}`,
      content: '',
      type: type,
      chartData: type === 'chart' ? {
        type: 'temperature',
        title: 'Évolution des Températures',
        data: []
      } : undefined
    };
    
    this.report.sections.push(newSection);
    this.activeSection = newSection.id;
  }

  updateSection(id: number, field: string, value: any): void {
    const sectionIndex = this.report.sections.findIndex(section => section.id === id);
    if (sectionIndex !== -1) {
      if (field === 'chartData') {
        this.report.sections[sectionIndex].chartData = value;
      } else {
        (this.report.sections[sectionIndex] as any)[field] = value;
      }
    }
  }

  deleteSection(id: number): void {
    this.report.sections = this.report.sections.filter(section => section.id !== id);
    if (this.activeSection === id && this.report.sections.length > 0) {
      this.activeSection = this.report.sections[0].id;
    }
  }

  getActiveSection(): ReportSection | undefined {
    return this.report.sections.find(section => section.id === this.activeSection);
  }

  getSectionIcon(type: string): string {
    switch (type) {
      case 'chart': return 'bar-chart';
      case 'image': return 'image';
      default: return 'file-earmark-text';
    }
  }

  formatTextWithMarkdown(text: string): string {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  togglePreview(): void {
    this.previewMode = !this.previewMode;
  }

  saveReport(): void {
    alert('Rapport sauvegardé avec succès!');
  }

  exportToPDF(): void {
    const element = document.getElementById('report-preview');

    if (!element) {
      alert('Erreur : contenu introuvable pour export PDF');
      return;
    }

    html2canvas(element, {
      scale: 2,
      useCORS: true
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight);
      pdf.save(`${this.report.title || 'rapport'}.pdf`);
    });
  }

  onSectionTitleChange(id: number, title: string): void {
    this.updateSection(id, 'title', title);
  }

  onSectionContentChange(id: number, content: string): void {
    this.updateSection(id, 'content', content);
  }

  onChartTypeChange(id: number, chartType: string): void {
    const section = this.getActiveSection();
    if (section && section.chartData) {
      const updatedChartData = {
        ...section.chartData,
        type: chartType
      };
      this.updateSection(id, 'chartData', updatedChartData);
    }
  }

  setActiveSection(id: number): void {
    this.activeSection = id;
  }

  configureChartData(): void {
    alert('Configuration des données du graphique...');
  }

  /** UPLOAD IMAGE */
  onImageUpload(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.updateSection(this.activeSection, 'content', base64);
    };
    reader.readAsDataURL(file);
  }

  /** Formatage (déjà existant) */
  insertFormatting(format: string): void { /* inchangé */ }
  insertAlignment(alignment: string): void { /* inchangé */ }
  insertClimateIcon(iconType: string): void { /* inchangé */ }
}
