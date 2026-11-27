import { describe, it, expect } from "vitest";
import { CatalogSchema, CardSchema, catalog, validateAnswerIndex, TERMOS_PROIBIDOS, contemTermoProibido } from "../src/lib/content";

describe("catálogo de cartas", () => {
  it("catalogo_tem_oitenta_cartas (V1)", () => {
    expect(catalog.cards).toHaveLength(80);
    const temas = ["bullying", "racismo", "xenofobia", "genero"] as const;
    for (const tema of temas) {
      expect(catalog.cards.filter((c) => c.theme === tema)).toHaveLength(20);
    }
  });

  it("toda_carta_passa_no_esquema (V2)", () => {
    const result = CatalogSchema.safeParse(catalog);
    expect(result.success).toBe(true);
    for (const card of catalog.cards) {
      expect(validateAnswerIndex(card)).toBe(true);
    }
  });

  it("carta_sem_fonte_reprova (V3)", () => {
    const invalida = {
      catalog_version: 1,
      cards: [
        {
          id: "teste-01",
          theme: "bullying",
          age_band: "8-11",
          objective: "Teste",
          stem: "Enunciado",
          options: ["A", "B", "C"],
          answer_index: 0,
          explanation: "Explicação longa o suficiente para passar no mínimo de sessenta caracteres.",
          source: "",
          review_status: "rascunho",
        },
      ],
    };
    expect(() => CatalogSchema.parse(invalida)).toThrow();
  });

  it("carta_com_termo_proibido_reprova (V3)", () => {
    const invalida = {
      catalog_version: 1,
      cards: [
        {
          id: "teste-02",
          theme: "bullying",
          age_band: "8-11",
          objective: "Teste",
          stem: "Enunciado com termo proibido sangue.",
          options: ["A", "B", "C"],
          answer_index: 0,
          explanation: "Explicação longa o suficiente para passar no mínimo de sessenta caracteres.",
          source: "Fonte válida",
          review_status: "rascunho",
        },
      ],
    };
    expect(() => CatalogSchema.parse(invalida)).toThrow();
  });

  it("versao_do_catalogo_e_positiva (V4)", () => {
    expect(catalog.catalog_version).toBeGreaterThan(0);
    expect(Number.isInteger(catalog.catalog_version)).toBe(true);
  });

  it("varredura_explanation_e_stem_contra_lista_proibida (V5)", () => {
    for (const card of catalog.cards) {
      const termoStem = contemTermoProibido(card.stem);
      expect(termoStem, `termo proibido no stem da carta ${card.id}: ${termoStem}`).toBeNull();

      const termoExplanation = contemTermoProibido(card.explanation);
      expect(termoExplanation, `termo proibido na explanation da carta ${card.id}: ${termoExplanation}`).toBeNull();

      expect(card.explanation.length).toBeGreaterThanOrEqual(60);
      expect(card.source.length).toBeGreaterThan(0);
    }
  });

  it("ids_unicos", () => {
    const ids = catalog.cards.map((c) => c.id);
    const unicos = new Set(ids);
    expect(unicos.size).toBe(ids.length);
  });
});