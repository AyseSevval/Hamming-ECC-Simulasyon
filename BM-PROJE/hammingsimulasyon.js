let M = 8; // Kullanıcının seçtiği veri bit uzunluğu (Varsayılan olarak 8 bit)
let N = 4; // Kullanıcının seçtiği kontrol bit uzunluğu (Varsayılan olarak 4 bit)
let toplamBitUzunlugu = M + N; // Toplam bit uzunluğu
 
let orijinalHammingKodu = []; // Orijinal Hamming kodu (1 tabanlı indeksleme)
let guncelHammingKodu = []; // Kullanıcı tarafından oluşturulan hatalı Hamming kodu (1 tabanlı indeksleme)

function simulasyonReset() {
    M= parseInt(document.getElementById("bitLength").value);
    N= hesaplaKontrolBitUzunlugu(M);
    toplamBitUzunlugu = M + N;

    if (M===8) document.getElementById('veriInput').value = "10110010"; // Varsayılan veri
    else if(M===16) document.getElementById('veriInput').value = "1101011001010110"; // 16 bit veri
    else if (M===32)document.getElementById('veriInput').value = "110101100101011011010101100101011"; // 32 bit veri

    document.getElementById('kullanicininGirdigiHammingKodu').value = "";
    document.getElementById('yardımcıMetin').placeholder="Lütfen tam olarak " + toplamBitUzunlugu + " bit uzunluğunda bir Hamming kodu giriniz.";
    document.getElementById('simulasyon').style.display = 'none';
}

function hesaplaKontrolBitUzunlugu(m) {
    let kontrolBitUzunlugu = 1;
    while (Math.pow(2, kontrolBitUzunlugu) < (m + kontrolBitUzunlugu + 1)) {
        kontrolBitUzunlugu++;
    }
    return kontrolBitUzunlugu;
}

function veriyiYaz() {
    const veriInput = document.getElementById('veriInput').value.trim();
    const ikilikTabanKontrolu = /^[01]+$/;

    M = veriInput.length;
    N = hesaplaKontrolBitUzunlugu(M);
    toplamBitUzunlugu = M + N;

    if (!ikilikTabanKontrolu.test(veriInput) || (M !== 8 && M !== 16 && M !== 32)) {
        alert("Lütfen sadece 0 ve 1 içeren; 8, 16 veya 32 bit uzunluğunda bir veri giriniz.");
        return;
    }
    
    document.getElementById('simulasyon').style.display = 'block'; 
    orijinalHammingKodu = new Array(toplamBitUzunlugu + 1).fill('0'); 
    let veriIndex = 0;

    for (let i = 1; i <= toplamBitUzunlugu; i++) {
        const kontrolBitiKonumuMu = (i & (i - 1)) === 0; 
        if (!kontrolBitiKonumuMu) {
            orijinalHammingKodu[i] = veriInput[veriIndex]; 
            veriIndex++;
        } else {  
            orijinalHammingKodu[i] = 'P'; 
        }
    }

    for (let i = 0; i < N; i++) { 
        const kontrolBitKonumu = Math.pow(2, i);
        orijinalHammingKodu[kontrolBitKonumu] = kontrolBitleriniHesapla(orijinalHammingKodu, kontrolBitKonumu);
    }

    guncelHammingKodu = [...orijinalHammingKodu]; 
    tabloyuCizVeSendromuAnalizEt(); 
}
function kontrolBitleriniHesapla(hammingKodu, hedeKontrolBitKonumu ) {
    let toplam = 0;
    for (let j=1; j <=toplamBitUzunlugu; j++) {
        if ((j & hedeKontrolBitKonumu) > 0 && j!==hedeKontrolBitKonumu) { // Kontrol bitinin etkilediği bitleri kontrol eder
            if(hammingKodu[j] !== 'P') {
                toplam ^= parseInt(hammingKodu[j]);
            }
        }
    }
    return (toplam % 2).toString();
}

function tabloyuCizVeSendromuAnalizEt() {
    const tabloGovdesi = document.getElementById('hammingTablosuGovdesi');
    tabloGovdesi.innerHTML = ""; // Tabloyu temizle
    for (let i = toplamBitUzunlugu; i >= 1; i--) { 
        const kontrolBitiMi = (i&(i-1)) === 0; // Kontrol bitlerinin konumunu kontrol eder
        const bitinDegeri = guncelHammingKodu[i] 
        const hataVarMi = bitinDegeri !== orijinalHammingKodu[i];

        let kutuRengi= kontrolBitiMi ? 'kontrol-bit-rengi' : 'veri-bit-rengi'; // Kontrol bitleri için farklı renk
        if (hataVarMi) {
            kutuRengi = 'hata-bit-rengi'; // Hatalı bitler için farklı renk
        }
        let bitEtiketi = kontrolBitiMi ? 'P' : 'D'; // Kontrol bitleri "P", veri bitleri "D" ile etiketlenir
        const kolon = document.createElement('div');
        kolon.className = `column is-1-desktop is-1-tablet is-1-mobile  p-1`;
        kolon.innerHTML = `
            <div class="bit-kutusu ${kutuRengi}" onclick="bitiTersleVeBoz(${i})" style="padding: 5px 2px;">
                <p class="is-size-7" style="font-size: 0.65rem !important;">Poz: ${i}</p>
                <p class="is-size-5 has-text-weight-bold">${bitinDegeri}</p>
                <p class="is-size-7" style="font-size: 0.65rem !important;">${bitEtiketi}${i}</p>
            </div>
        `;
        tabloGovdesi.appendChild(kolon);
    }
    hesaplaVeDuzeltSendrom();
}

function bitiTersleVeBoz(bitKonumu) {
    guncelHammingKodu[bitKonumu] = guncelHammingKodu[bitKonumu] === '0' ? '1' : '0'; // Bit değerini tersle
    tabloyuCizVeSendromuAnalizEt(); // Tabloyu güncelle ve sendromu analiz et   
}
function hesaplaVeDuzeltSendrom() {
    let sendromBitleri= [];
    let pariteHesapBilgileri = [];

    for (let i = 0; i < N; i++) {
        const kontrolBitKonumu = Math.pow(2, i);
        let yeniKontrolBitDegeri = kontrolBitleriniHesapla(guncelHammingKodu, kontrolBitKonumu);

        let mevcutKontrolBitDegeri = guncelHammingKodu[kontrolBitKonumu];
        let sendromBitDegeri = (parseInt(yeniKontrolBitDegeri) ^ parseInt(mevcutKontrolBitDegeri)).toString();

        
        
        sendromBitleri.push(sendromBitDegeri);
        pariteHesapBilgileri.push({
            kontrolBitKonumu: kontrolBitKonumu,
            hesaplananDeger: yeniKontrolBitDegeri,
            orijinalDeger: orijinalHammingKodu[kontrolBitKonumu]
        });
    }
    let sendromMetni = "Sendrom: " + [...sendromBitleri].reverse().join(''); // Kopya üzerinde ters çeviriyoruz

    let hatalıBitKonumu = 0;
    for (let i = 0; i < sendromBitleri.length; i++) {
        if (sendromBitleri[i] === '1') {
            hatalıBitKonumu += Math.pow(2, i);
        }
}


document.getElementById('yeniHesaplananKontrolBitleri').innerText = pariteHesapBilgileri.map(p => `P${p.kontrolBitKonumu}=${p.hesaplananDeger}`).join(', ');
document.getElementById('sendromSonucu').innerText = sendromMetni;

let duzeltilmisHammingKodu = [...guncelHammingKodu];
const durumMesajiElementi = document.getElementById('durumMesaji');


if (hatalıBitKonumu === 0) {
    durumMesajiElementi.innerText = "Hata bulunamadı. Veri Temiz.";
    durumMesajiElementi.className = "has-text-success";
} else if (hatalıBitKonumu<= toplamBitUzunlugu) {
    duzeltilmisHammingKodu[hatalıBitKonumu] = duzeltilmisHammingKodu[hatalıBitKonumu] === '0' ? '1' : '0';
    durumMesajiElementi.innerText = `Hata tespit edildi. Hatalı bit konumu: ${hatalıBitKonumu}. Düzeltildi. `;
    durumMesajiElementi.className = "has-text-danger";
} else {
    durumMesajiElementi.innerText = `Sendrom değeri (${hatalıBitKonumu}) sınırların dışında.Birden fazla hata olabilir veya sendrom yanlış hesaplanmış olabilir. Düzeltme yapılamadı.`;
    durumMesajiElementi.className = "has-text-warning";
}

let temizVeri = "";
for (let i = 1; i <= toplamBitUzunlugu; i++) {
    const kontrolBitiKonumuMu = (i & (i - 1)) === 0; // Kontrol bitlerinin konumunu kontrol eder
    if (!kontrolBitiKonumuMu) {
        temizVeri += duzeltilmisHammingKodu[i];
    }   
}

document.getElementById('duzeltilmisHammingKodu').innerText = temizVeri;
}
window.onload = function() {
    simulasyonReset();
};