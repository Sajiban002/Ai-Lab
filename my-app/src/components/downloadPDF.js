import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export const downloadMedicalPDF = async ({
  patientDescription,
  diagnosisPredictions,
  recommendedMedications,
  generatedText
}) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');

    pdf.addFont('/fonts/PTSans-Regular.ttf', 'PTSans', 'normal');
    pdf.addFont('/fonts/PTSans-Bold.ttf', 'PTSans', 'bold');
    pdf.addFont('/fonts/PTSans-Italic.ttf', 'PTSans', 'italic');

    // Устанавливаем шрифт с поддержкой кириллицы как основной
    pdf.setFont('PTSans');

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = margin;

    // Заголовок
    pdf.setFont('PTSans', 'bold');
    pdf.setFontSize(18);
    const title = 'Медицинский анализ симптомов';
    pdf.text(title, pageWidth / 2, yPos, { align: 'center' });

    yPos += 10;

    // Дата анализа
    const currentDate = format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: ru });
    pdf.setFontSize(10);
    pdf.setFont('PTSans', 'normal');
    pdf.text(`Дата анализа: ${currentDate}`, pageWidth / 2, yPos, { align: 'center' });

    yPos += 15;

    // Описание симптомов
    pdf.setFontSize(12);
    pdf.setFont('PTSans', 'bold');
    pdf.text('Описание симптомов пациента:', margin, yPos);
    yPos += 7;

    pdf.setFontSize(10);
    pdf.setFont('PTSans', 'normal');

    const splitDescription = pdf.splitTextToSize(patientDescription, pageWidth - margin * 2);
    pdf.text(splitDescription, margin, yPos);
    yPos += splitDescription.length * 5 + 10;

    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPos - 5, pageWidth - margin, yPos - 5);

    // Результаты анализа
    pdf.setFontSize(12);
    pdf.setFont('PTSans', 'bold');
    pdf.text('Результаты анализа:', margin, yPos);
    yPos += 7;

    const mainDiagnosisPart = generatedText.match(/ОСНОВНОЙ ДИАГНОЗ:(.*?)(?=\n\n|$)/s);
    const symptomsPart = generatedText.match(/СИМПТОМАТИКА:(.*?)(?=\n\n|$)/s);
    const recommendationsPart = generatedText.match(/РЕКОМЕНДАЦИИ:(.*?)(?=\n\n|$)/s);
    const importantPart = generatedText.match(/ВАЖНО:(.*?)(?=\n\n|$)/s);

    if (mainDiagnosisPart && mainDiagnosisPart[1]) {
      pdf.setFontSize(11);
      pdf.setFont('PTSans', 'bold');
      pdf.text('ОСНОВНОЙ ДИАГНОЗ:', margin, yPos);
      yPos += 6;

      pdf.setFont('PTSans', 'normal');
      const mainDiagnosisContent = mainDiagnosisPart[1].trim().replace(/^\s*\*\s+/gm, '- ');
      const splitMainDiagnosis = pdf.splitTextToSize(mainDiagnosisContent, pageWidth - margin * 2);
      pdf.text(splitMainDiagnosis, margin, yPos);
      yPos += splitMainDiagnosis.length * 5 + 7;
    }

    if (symptomsPart && symptomsPart[1]) {
      if (yPos > pageHeight - 50) {
        pdf.addPage();
        yPos = margin;
      }

      pdf.setFont('PTSans', 'bold');
      pdf.text('СИМПТОМАТИКА:', margin, yPos);
      yPos += 6;

      pdf.setFont('PTSans', 'normal');
      const symptomsContent = symptomsPart[1].trim().replace(/^\s*\*\s+/gm, '- ');
      const splitSymptoms = pdf.splitTextToSize(symptomsContent, pageWidth - margin * 2);
      pdf.text(splitSymptoms, margin, yPos);
      yPos += splitSymptoms.length * 5 + 7;
    }

    if (recommendationsPart && recommendationsPart[1]) {
      if (yPos > pageHeight - 50) {
        pdf.addPage();
        yPos = margin;
      }

      pdf.setFont('PTSans', 'bold');
      pdf.text('РЕКОМЕНДАЦИИ:', margin, yPos);
      yPos += 6;

      pdf.setFont('PTSans', 'normal');
      const recommendationsContent = recommendationsPart[1].trim().replace(/^\s*\*\s+/gm, '- ');
      const splitRecommendations = pdf.splitTextToSize(recommendationsContent, pageWidth - margin * 2);
      pdf.text(splitRecommendations, margin, yPos);
      yPos += splitRecommendations.length * 5 + 7;
    }

    if (importantPart && importantPart[1]) {
      if (yPos > pageHeight - 50) {
        pdf.addPage();
        yPos = margin;
      }

      pdf.setTextColor(220, 53, 69);
      pdf.setFont('PTSans', 'bold');
      pdf.text('ВАЖНО:', margin, yPos);
      yPos += 6;

      const importantContent = importantPart[1].trim().replace(/^\s*\*\s+/gm, '- ');
      const splitImportant = pdf.splitTextToSize(importantContent, pageWidth - margin * 2);
      pdf.text(splitImportant, margin, yPos);
      pdf.setTextColor(0, 0, 0);
      yPos += splitImportant.length * 5 + 10;
    }

    // Добавляем новую страницу только если нужно
    if (diagnosisPredictions && diagnosisPredictions.length > 0 && yPos > pageHeight - 50) {
      pdf.addPage();
      yPos = margin;
    }

    // Вероятность диагнозов
    if (diagnosisPredictions && diagnosisPredictions.length > 0) {
      pdf.setFontSize(12);
      pdf.setFont('PTSans', 'bold');
      pdf.text('Вероятность диагнозов:', margin, yPos);
      yPos += 7;

      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPos, pageWidth - margin * 2, 7, 'F');

      pdf.setFontSize(10);
      pdf.setFont('PTSans', 'bold');
      pdf.text('Диагноз', margin + 5, yPos + 5);
      pdf.text('Вероятность', pageWidth - margin - 25, yPos + 5);

      yPos += 7;

      diagnosisPredictions.forEach((diagnosis, index) => {
        if (index % 2 === 0) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(margin, yPos, pageWidth - margin * 2, 7, 'F');
        }

        pdf.setFont('PTSans', 'normal');
        const diagnosisName = diagnosis.name.length > 50
          ? diagnosis.name.substring(0, 50) + '...'
          : diagnosis.name;

        pdf.text(diagnosisName, margin + 5, yPos + 5);
        pdf.text(`${diagnosis.probability}%`, pageWidth - margin - 25, yPos + 5);

        yPos += 7;
      });

      yPos += 10;
    }

    // Рекомендуемые медикаменты
    if (recommendedMedications && recommendedMedications.length > 0) {
      if (yPos > pageHeight - 50) {
        pdf.addPage();
        yPos = margin;
      }

      pdf.setFontSize(12);
      pdf.setFont('PTSans', 'bold');
      pdf.text('Рекомендуемые медикаменты:', margin, yPos);
      yPos += 7;

      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPos, pageWidth - margin * 2, 7, 'F');

      pdf.setFontSize(10);
      pdf.setFont('PTSans', 'bold');
      pdf.text('Название', margin + 5, yPos + 5);
      pdf.text('Категория', pageWidth - margin - 40, yPos + 5);

      yPos += 7;

      recommendedMedications.forEach((med, index) => {
        if (index % 2 === 0) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(margin, yPos, pageWidth - margin * 2, 7, 'F');
        }

        pdf.setFont('PTSans', 'normal');
        const medName = med.name.replace(/^\*\s*/, '');
        pdf.text(medName.length > 50 ? medName.substring(0, 50) + '...' : medName, margin + 5, yPos + 5);
        pdf.text(med.category || 'Общее', pageWidth - margin - 40, yPos + 5);

        yPos += 7;
      });

      yPos += 10;
    }

    // Проверяем, достаточно ли места для дисклеймера на текущей странице
    const disclaimerHeight = 15; // примерная высота для дисклеймера
    
    // Если недостаточно места, добавляем небольшой отступ до конца страницы
    if (yPos > pageHeight - disclaimerHeight - 10) {
      yPos = pageHeight - disclaimerHeight - 10;
    }

    // Дисклеймер - теперь добавляем его в конец текущей страницы
    pdf.setFontSize(9);
    pdf.setFont('PTSans', 'italic');
    pdf.setTextColor(100, 100, 100);

    const disclaimer = 'Данная информация предоставляется исключительно в ознакомительных целях и не заменяет консультацию квалифицированного медицинского специалиста. Точность анализа не гарантирована.';
    const splitDisclaimer = pdf.splitTextToSize(disclaimer, pageWidth - margin * 2);
    pdf.text(splitDisclaimer, pageWidth / 2, yPos, { align: 'center' });

    const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm');
    const filename = `Медицинский_анализ_${timestamp}.pdf`;

    pdf.save(filename);
    return filename;
  } catch (error) {
    console.error('Ошибка при создании PDF:', error);
    throw new Error('Не удалось создать PDF файл');
  }
};