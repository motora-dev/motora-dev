import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "プライバシーポリシー - もとら's dev",
  description: "もとら's dev のプライバシーポリシー",
};

export default function PrivacyPage() {
  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 16px',
      }}
    >
      <h1
        style={{
          fontSize: '28px',
          fontWeight: 'bold',
          marginBottom: '24px',
          color: '#111827',
        }}
      >
        プライバシーポリシー
      </h1>

      <div
        style={{
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#374151',
        }}
      >
        <section style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#1F2937',
            }}
          >
            1. はじめに
          </h2>
          <p style={{ marginBottom: '12px' }}>
            もとら&apos;s
            dev（以下「当サイト」）では、ユーザーの皆様のプライバシーを尊重し、個人情報の保護に努めています。本プライバシーポリシーでは、当サイトにおける個人情報の取り扱いについて説明します。
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#1F2937',
            }}
          >
            2. Google Analyticsの使用について
          </h2>
          <p style={{ marginBottom: '12px' }}>
            当サイトでは、サイトの利用状況を把握し、サービスの改善を目的として、Google Analytics を使用しています。
          </p>
          <p style={{ marginBottom: '12px' }}>
            Google Analytics
            は、クッキー（Cookie）を使用して、ユーザーのサイト利用状況を分析します。この分析データは匿名で収集されており、個人を特定するものではありません。
          </p>
          <p style={{ marginBottom: '12px' }}>
            Google Analytics による情報収集を無効にしたい場合は、Google が提供する
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#2563EB',
                textDecoration: 'underline',
              }}
            >
              オプトアウトアドオン
            </a>
            をご利用ください。
          </p>
          <p style={{ marginBottom: '12px' }}>
            Google Analytics の利用規約については、
            <a
              href="https://marketingplatform.google.com/about/analytics/terms/jp/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#2563EB',
                textDecoration: 'underline',
              }}
            >
              こちら
            </a>
            をご覧ください。
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#1F2937',
            }}
          >
            3. Google AdSenseについて
          </h2>
          <p style={{ marginBottom: '12px' }}>
            当サイトでは、広告配信サービスとして Google AdSense を利用する予定です。
          </p>
          <p style={{ marginBottom: '12px' }}>
            Google AdSense
            は、第三者配信の広告サービスであり、ユーザーの興味に応じた広告を表示するために、クッキー（Cookie）を使用します。クッキーを使用することで、ユーザーのブラウザを識別できますが、個人を特定することはできません。
          </p>
          <p style={{ marginBottom: '12px' }}>
            Google が広告配信に使用する DoubleClick Cookie
            により、ユーザーが当サイトや他のサイトにアクセスした際の情報に基づいて、適切な広告を表示できます。
          </p>
          <p style={{ marginBottom: '12px' }}>
            パーソナライズド広告を無効にする場合は、
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#2563EB',
                textDecoration: 'underline',
              }}
            >
              広告設定
            </a>
            からオプトアウトできます。また、
            <a
              href="https://www.aboutads.info/choices/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#2563EB',
                textDecoration: 'underline',
              }}
            >
              www.aboutads.info
            </a>
            から、第三者配信事業者のクッキーを無効にすることもできます。
          </p>
          <p style={{ marginBottom: '12px' }}>
            Google の広告に関するポリシーと規約については、
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#2563EB',
                textDecoration: 'underline',
              }}
            >
              こちら
            </a>
            をご覧ください。
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#1F2937',
            }}
          >
            4. クッキー（Cookie）について
          </h2>
          <p style={{ marginBottom: '12px' }}>
            当サイトでは、サイトの利便性向上のためにクッキーを使用しています。クッキーとは、ウェブサイトがユーザーのコンピューターに保存する小さなテキストファイルです。
          </p>
          <p style={{ marginBottom: '12px' }}>
            ブラウザの設定により、クッキーの受け取りを拒否したり、クッキーを受け取った際に警告を表示させることが可能です。ただし、クッキーを無効にすると、当サイトの一部機能が正常に動作しない場合があります。
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#1F2937',
            }}
          >
            5. 個人情報の取り扱いについて
          </h2>
          <p style={{ marginBottom: '12px' }}>
            当サイトでは、お問い合わせやコメントなどを通じて個人情報を取得する場合があります。取得した個人情報は、以下の目的でのみ使用します：
          </p>
          <ul
            style={{
              listStyleType: 'disc',
              paddingLeft: '24px',
              marginBottom: '12px',
            }}
          >
            <li>お問い合わせへの対応</li>
            <li>サイト運営上必要な連絡</li>
            <li>サービスの改善</li>
          </ul>
          <p style={{ marginBottom: '12px' }}>
            当サイトは、法令に基づく場合を除き、ユーザーの同意なく第三者に個人情報を提供することはありません。
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#1F2937',
            }}
          >
            6. 免責事項
          </h2>
          <p style={{ marginBottom: '12px' }}>
            当サイトに掲載されている情報の正確性には万全を期していますが、利用者が当サイトの情報を用いて行う一切の行為について、当サイトは一切の責任を負いません。
          </p>
          <p style={{ marginBottom: '12px' }}>
            当サイトからリンクされている外部サイトについては、当サイトは一切の責任を負いません。
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#1F2937',
            }}
          >
            7. プライバシーポリシーの変更
          </h2>
          <p style={{ marginBottom: '12px' }}>
            当サイトは、本プライバシーポリシーの内容を適宜見直し、予告なく変更することがあります。変更後のプライバシーポリシーは、当サイトに掲載した時点から効力を生じるものとします。
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#1F2937',
            }}
          >
            8. お問い合わせ
          </h2>
          <p style={{ marginBottom: '12px' }}>
            本プライバシーポリシーに関するお問い合わせは、
            <a
              href="https://github.com/motora-dev/motora-dev/issues"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#2563EB',
                textDecoration: 'underline',
              }}
            >
              GitHub Issues
            </a>
            よりお願いいたします。
          </p>
        </section>

        <p
          style={{
            textAlign: 'right',
            color: '#6B7280',
            fontSize: '12px',
            marginTop: '32px',
          }}
        >
          制定日：2025年1月1日
        </p>
      </div>
    </div>
  );
}
