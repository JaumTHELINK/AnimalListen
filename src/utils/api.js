import { supabase } from '@/integrations/supabase/client';

// Helper to get current assinante_id
async function getAssinanteId() {
  const { data } = await supabase.rpc('get_current_assinante_id');
  return data;
}

// Calculate age from date of birth
function calcIdade(dataNasc) {
  if (!dataNasc) return '';
  const birth = new Date(dataNasc + 'T12:00:00');
  const now = new Date();
  const totalMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years > 0 && months > 0) return `${years}a ${months}m`;
  if (years > 0) return `${years}a`;
  if (months > 0) return `${months}m`;
  return 'Recém-nascido';
}

// Map DB tutor → ApexVet format
function mapTutorFromDb(t) {
  if (!t) return t;
  const parts = (t.endereco || '').split(',').map(s => s.trim());
  return {
    ...t,
    nome_completo: t.nome,
    endereco_rua: parts[0] || '',
    endereco_numero: parts[1] || '',
    endereco_bairro: parts[2] || '',
    endereco_cidade: parts[3] || '',
    endereco_cep: '',
  };
}

// Map ApexVet tutor → DB format
function mapTutorToDb(data, assinanteId) {
  const endereco = [data.endereco_rua, data.endereco_numero, data.endereco_bairro, data.endereco_cidade]
    .filter(Boolean).join(', ');
  return {
    nome: data.nome_completo || data.nome,
    cpf: data.cpf || null,
    telefone: data.telefone || null,
    email: data.email || null,
    endereco: endereco || null,
    observacoes: data.observacoes || null,
    assinante_id: assinanteId,
  };
}

// Map DB paciente → ApexVet animal format
function mapAnimalFromDb(a, tutorData) {
  if (!a) return a;
  return {
    ...a,
    foto_base64: a.foto,
    idade_calculada: calcIdade(a.data_nascimento),
    tutor: tutorData ? mapTutorFromDb(tutorData) : undefined,
  };
}

// Map ApexVet animal → DB format
function mapAnimalToDb(data) {
  const d = { ...data };
  if ('foto_base64' in d) {
    d.foto = d.foto_base64;
    delete d.foto_base64;
  }
  delete d.idade_calculada;
  delete d.tutor;
  // Remove non-DB fields
  delete d.id;
  return d;
}

// Map DB triagem → ApexVet format
function mapTriagemFromDb(t, animalData, tutorData) {
  return {
    ...t,
    animal_id: t.paciente_id,
    animal: animalData ? mapAnimalFromDb(animalData, tutorData) : undefined,
    tutor: tutorData ? mapTutorFromDb(tutorData) : undefined,
  };
}

// Map DB internacao → ApexVet format
function mapInternacaoFromDb(i) {
  return {
    ...i,
    registros: i._registros || [],
  };
}

// ============ MAIN API FUNCTIONS ============

export async function apiRequest(path, options = {}) {
  // For external URLs
  if (/^https?:\/\//i.test(path)) {
    const res = await fetch(path, options);
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    return res;
  }
  // Supabase operations return Response-like objects
  throw new Error(`apiRequest not implemented for path: ${path}`);
}

export async function apiJson(path, options = {}) {
  const { method = 'GET', body } = options;

  // Handle external URLs (like viacep)
  if (/^https?:\/\//i.test(path)) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    return res.json();
  }

  const assinanteId = await getAssinanteId();

  // Parse path
  const [pathname, queryString] = path.split('?');
  const params = new URLSearchParams(queryString || '');
  const segments = pathname.split('/').filter(Boolean);

  // ===== TUTORES =====
  if (segments[0] === 'tutores') {
    if (segments.length === 1 && method === 'GET') {
      const { data, error } = await supabase
        .from('tutores')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(t => mapTutorFromDb(t));
    }

    if (segments.length === 1 && method === 'POST') {
      const dbData = mapTutorToDb(body, assinanteId);
      const { data, error } = await supabase.from('tutores').insert(dbData).select().single();
      if (error) throw error;
      return mapTutorFromDb(data);
    }

    if (segments.length === 2 && method === 'GET') {
      const { data, error } = await supabase.from('tutores').select('*').eq('id', segments[1]).single();
      if (error) throw error;
      return mapTutorFromDb(data);
    }

    if (segments.length === 2 && method === 'PUT') {
      const dbData = mapTutorToDb(body, assinanteId);
      const { data, error } = await supabase.from('tutores').update(dbData).eq('id', segments[1]).select().single();
      if (error) throw error;
      return mapTutorFromDb(data);
    }

    if (segments.length === 2 && method === 'DELETE') {
      const { error } = await supabase.from('tutores').delete().eq('id', segments[1]);
      if (error) throw error;
      return null;
    }
  }

  // ===== ANIMAIS / PACIENTES =====
  if (segments[0] === 'animais') {
    if (segments.length === 1 && method === 'GET') {
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(a => mapAnimalFromDb(a));
    }

    if (segments.length === 1 && method === 'POST') {
      const dbData = mapAnimalToDb(body);
      dbData.nome = dbData.nome || 'Sem nome';
      const { data, error } = await supabase.from('pacientes').insert(dbData).select().single();
      if (error) throw error;
      return mapAnimalFromDb(data);
    }

    if (segments.length === 2 && segments[1] !== 'pesos' && method === 'GET') {
      const { data, error } = await supabase.from('pacientes').select('*').eq('id', segments[1]).single();
      if (error) throw error;
      return mapAnimalFromDb(data);
    }

    if (segments.length === 2 && method === 'PUT') {
      const dbData = mapAnimalToDb(body);
      const { data, error } = await supabase.from('pacientes').update(dbData).eq('id', segments[1]).select().single();
      if (error) throw error;
      return mapAnimalFromDb(data);
    }

    if (segments.length === 2 && method === 'DELETE') {
      const { error } = await supabase.from('pacientes').delete().eq('id', segments[1]);
      if (error) throw error;
      return null;
    }

    // /animais/:id/pesos
    if (segments.length === 3 && segments[2] === 'pesos' && method === 'GET') {
      const { data, error } = await supabase
        .from('paciente_pesos')
        .select('*')
        .eq('paciente_id', segments[1])
        .order('data', { ascending: false });
      if (error) throw error;
      return data || [];
    }

    if (segments.length === 3 && segments[2] === 'pesos' && method === 'POST') {
      const { data, error } = await supabase
        .from('paciente_pesos')
        .insert({ ...body, paciente_id: segments[1], assinante_id: assinanteId })
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    // /animais/:id/pesos/:pesoId
    if (segments.length === 4 && segments[2] === 'pesos' && method === 'DELETE') {
      const { error } = await supabase.from('paciente_pesos').delete().eq('id', segments[3]);
      if (error) throw error;
      return null;
    }
  }

  // ===== TRIAGENS =====
  if (segments[0] === 'triagens') {
    if (segments.length === 1 && method === 'GET') {
      const { data, error } = await supabase
        .from('triagens')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Fetch related animals and tutors
      const pacienteIds = [...new Set((data || []).map(t => t.paciente_id))];
      const { data: pacientes } = await supabase.from('pacientes').select('*').in('id', pacienteIds);
      const pacienteMap = {};
      (pacientes || []).forEach(p => { pacienteMap[p.id] = p; });

      const tutorIds = [...new Set((pacientes || []).map(p => p.tutor_id))];
      const { data: tutoresData } = await supabase.from('tutores').select('*').in('id', tutorIds);
      const tutorMap = {};
      (tutoresData || []).forEach(t => { tutorMap[t.id] = t; });

      return (data || []).map(t => {
        const animal = pacienteMap[t.paciente_id];
        const tutor = animal ? tutorMap[animal.tutor_id] : undefined;
        return mapTriagemFromDb(t, animal, tutor);
      });
    }

    if (segments.length === 1 && method === 'POST') {
      const { data, error } = await supabase
        .from('triagens')
        .insert({
          paciente_id: body.animal_id,
          queixa_principal: body.queixa_principal,
          prioridade: body.prioridade,
          aviso_profissional: body.aviso_profissional || null,
          assinante_id: assinanteId,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    if (segments.length === 2 && method === 'GET') {
      const { data, error } = await supabase.from('triagens').select('*').eq('id', segments[1]).single();
      if (error) throw error;

      // Fetch animal + tutor
      const { data: animal } = await supabase.from('pacientes').select('*').eq('id', data.paciente_id).single();
      let tutor = null;
      if (animal) {
        const { data: t } = await supabase.from('tutores').select('*').eq('id', animal.tutor_id).single();
        tutor = t;
      }
      return mapTriagemFromDb(data, animal, tutor);
    }

    if (segments.length === 2 && method === 'DELETE') {
      const { error } = await supabase.from('triagens').delete().eq('id', segments[1]);
      if (error) throw error;
      return null;
    }
  }

  // ===== INTERNACOES =====
  if (segments[0] === 'internacoes') {
    if (segments.length === 1 && method === 'GET') {
      const { data, error } = await supabase
        .from('internacoes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Fetch registros for each
      const ids = (data || []).map(i => i.id);
      const { data: registros } = await supabase
        .from('internacao_registros')
        .select('*')
        .in('internacao_id', ids)
        .order('created_at', { ascending: true });

      const regMap = {};
      (registros || []).forEach(r => {
        if (!regMap[r.internacao_id]) regMap[r.internacao_id] = [];
        regMap[r.internacao_id].push({ ...r, data_hora: r.hora || r.created_at });
      });

      return (data || []).map(i => ({
        ...i,
        registros: regMap[i.id] || [],
      }));
    }

    if (segments.length === 1 && method === 'POST') {
      // Fetch animal data
      const { data: animal } = await supabase.from('pacientes').select('*').eq('id', body.animal_id).single();
      let tutorNome = '', tutorCpf = '', tutorTelefone = '';
      if (animal) {
        const { data: tutor } = await supabase.from('tutores').select('*').eq('id', animal.tutor_id).single();
        if (tutor) {
          tutorNome = tutor.nome;
          tutorCpf = tutor.cpf;
          tutorTelefone = tutor.telefone;
        }
      }

      const { data, error } = await supabase
        .from('internacoes')
        .insert({
          animal_nome: animal?.nome,
          animal_especie: animal?.especie,
          animal_raca: animal?.raca,
          animal_idade: animal?.idade,
          animal_peso: animal?.peso,
          animal_microchip: animal?.microchip,
          tutor_nome: tutorNome,
          tutor_cpf: tutorCpf,
          tutor_telefone: tutorTelefone,
          data_internacao: body.data_internacao,
          motivo: body.motivo,
          observacoes: body.observacoes,
          status: body.status || 'estavel',
          assinante_id: assinanteId,
          foto: animal?.foto,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    if (segments.length === 2 && method === 'PUT') {
      const { data, error } = await supabase
        .from('internacoes')
        .update(body)
        .eq('id', segments[1])
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    // /internacoes/:id/status?status=xxx
    if (segments.length === 3 && segments[2] === 'status' && method === 'PUT') {
      const status = params.get('status');
      const { data, error } = await supabase
        .from('internacoes')
        .update({ status })
        .eq('id', segments[1])
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    // /internacoes/:id/registros
    if (segments.length === 3 && segments[2] === 'registros' && method === 'POST') {
      const { data, error } = await supabase
        .from('internacao_registros')
        .insert({
          internacao_id: segments[1],
          tipo: body.tipo,
          valor: body.valor,
          notas: body.notas || null,
          hora: body.data_hora || new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return { ...data, data_hora: data.hora || data.created_at };
    }
  }

  // ===== PRONTUARIOS =====
  if (segments[0] === 'prontuarios') {
    if (segments.length === 1 && method === 'GET') {
      let query = supabase.from('prontuarios').select('*').order('created_at', { ascending: false });
      const animalId = params.get('animal_id');
      if (animalId) query = query.eq('paciente_id', animalId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(p => ({ ...p, animal_id: p.paciente_id }));
    }

    if (segments.length === 1 && method === 'POST') {
      const { data: assinanteData } = await supabase.from('assinantes').select('crmv').eq('id', assinanteId).single();

      const { data, error } = await supabase
        .from('prontuarios')
        .insert({
          numero_prontuario: body.numero_prontuario || `PRT-${Math.floor(Math.random() * 100000)}`,
          paciente_id: body.animal_id,
          triagem_id: body.triagem_id || null,
          queixa_principal: body.queixa_principal,
          historico_doenca: body.historico_doenca,
          evolucao_clinica: body.evolucao_clinica,
          sintomas: body.sintomas,
          comportamento: body.comportamento,
          temperatura: body.temperatura,
          frequencia_cardiaca: body.frequencia_cardiaca,
          frequencia_respiratoria: body.frequencia_respiratoria,
          tempo_preenchimento_capilar: body.tempo_preenchimento_capilar,
          glicose: body.glicose,
          hidratacao: body.hidratacao,
          linfonodos: body.linfonodos,
          mucosas: body.mucosas,
          palpacao_abdominal: body.palpacao_abdominal,
          outros_achados: body.outros_achados,
          suspeita_diagnostica: body.suspeita_diagnostica,
          diagnostico_definitivo: body.diagnostico_definitivo,
          tratamento_prescrito: body.tratamento_prescrito,
          medicamentos: body.medicamentos,
          exames_solicitados: body.exames_solicitados,
          procedimentos_realizados: body.procedimentos_realizados,
          atualizacao_vacinal: body.atualizacao_vacinal,
          observacoes_gerais: body.observacoes_gerais,
          recomendacoes: body.recomendacoes,
          veterinario_crmv: body.veterinario_crmv || assinanteData?.crmv || null,
          termo_consentimento_assinado: body.termo_consentimento_assinado,
          data_atendimento: new Date().toISOString(),
          assinante_id: assinanteId,
          animal_peso: body.animal_peso ? parseFloat(body.animal_peso) : null,
        })
        .select()
        .single();
      if (error) throw error;

      // Mark triagem as atendida
      if (body.triagem_id) {
        await supabase.from('triagens').update({ atendida: true }).eq('id', body.triagem_id);
      }

      return { ...data, animal_id: data.paciente_id };
    }
  }

  // ===== VACINAS =====
  if (segments[0] === 'vacinas') {
    if (segments.length === 1 && method === 'POST') {
      const { data, error } = await supabase
        .from('vacinas')
        .insert({ ...body, assinante_id: assinanteId })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }

  throw new Error(`API route not implemented: ${method} ${path}`);
}

// AI API base URL placeholder
export const AI_API_BASE_URL = '';
