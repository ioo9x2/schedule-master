import emailjs from '@emailjs/browser';

// EmailJS設定
const EMAILJS_CONFIG = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_default',
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_default',
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'your_public_key'
};

// EmailJSの初期化
if (typeof window !== 'undefined') {
  emailjs.init(EMAILJS_CONFIG.publicKey);
}

export const sendReservationEmail = async (reservationData) => {
  try {
    const formatDate = (dateStr, timeStr) => {
      const date = new Date(dateStr);
      return `${date.toLocaleDateString('ja-JP', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      })} ${timeStr}`;
    };

    const templateParams = {
      to_email: reservationData.employeeEmail,
      cc_email: 'k.hirate.95t@tec.witc.co.jp',
      from_name: '平手',
      from_email: 'k.hirate.95t@tec.witc.co.jp',
      subject: '面談予約完了のお知らせ',
      reservation_name: reservationData.reservationName,
      reservation_datetime: formatDate(reservationData.date, reservationData.time),
      reservation_date: reservationData.date,
      reservation_time: reservationData.time,
      担当者: '平手',
      message: `
${reservationData.reservationName} 様

面談のご予約が完了いたしました。以下の内容でお間違いないかご確認ください。

【予約詳細】
日時：${formatDate(reservationData.date, reservationData.time)}
予約者：${reservationData.reservationName}
担当者：平手

※ご注意
予約時間の15分前までにお越しください。
ご都合が悪くなった場合は、お早めにご連絡をお願いいたします。

お問い合わせ先：k.hirate.95t@tec.witc.co.jp

このメールは自動送信されています。
      `
    };

    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams
    );

    console.log('メール送信成功:', result);
    return { success: true, result };

  } catch (error) {
    console.error('メール送信エラー:', error);
    return { success: false, error };
  }
};