export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string | null
          department: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string | null
          department?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string | null
          department?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          content: string
          author_id: string
          board_id: string
          created_at: string
          updated_at: string
          likes_count: number
          comments_count: number
          views_count: number
        }
        Insert: {
          id?: string
          title: string
          content: string
          author_id: string
          board_id: string
          created_at?: string
          updated_at?: string
          likes_count?: number
          comments_count?: number
          views_count?: number
        }
        Update: {
          id?: string
          title?: string
          content?: string
          author_id?: string
          board_id?: string
          created_at?: string
          updated_at?: string
          likes_count?: number
          comments_count?: number
          views_count?: number
        }
      }
      boards: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
          posts_count: number
          required_roles: string[] | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
          posts_count?: number
          required_roles?: string[] | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          posts_count?: number
          required_roles?: string[] | null
        }
      }
      comments: {
        Row: {
          id: string
          content: string
          author_id: string
          post_id: string
          parent_id: string | null
          created_at: string
          updated_at: string
          likes_count: number
        }
        Insert: {
          id?: string
          content: string
          author_id: string
          post_id: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
          likes_count?: number
        }
        Update: {
          id?: string
          content?: string
          author_id?: string
          post_id?: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
          likes_count?: number
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          post_id: string | null
          comment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id?: string | null
          comment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string | null
          comment_id?: string | null
          created_at?: string
        }
      }
      components: {
        Row: {
          id: string
          name: string
          category: string
          tdp: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          tdp: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          tdp?: number
          created_at?: string
          updated_at?: string
        }
      }
      cpus: {
        Row: {
          id: string
          name: string
          tdp: number
          cores: number
          threads: number
          base_clock: number
          boost_clock: number | null
          socket: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          tdp: number
          cores: number
          threads: number
          base_clock: number
          boost_clock?: number | null
          socket: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          tdp?: number
          cores?: number
          threads?: number
          base_clock?: number
          boost_clock?: number | null
          socket?: string
          created_at?: string
          updated_at?: string
        }
      }
      gpus: {
        Row: {
          id: string
          name: string
          tdp: number
          memory: number
          memory_type: string
          cuda_cores: number | null
          rt_cores: number | null
          tensor_cores: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          tdp: number
          memory: number
          memory_type: string
          cuda_cores?: number | null
          rt_cores?: number | null
          tensor_cores?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          tdp?: number
          memory?: number
          memory_type?: string
          cuda_cores?: number | null
          rt_cores?: number | null
          tensor_cores?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      motherboards: {
        Row: {
          id: string
          name: string
          tdp: number
          socket: string
          chipset: string
          max_memory: number
          memory_slots: number
          pcie_slots: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          tdp: number
          socket: string
          chipset: string
          max_memory: number
          memory_slots: number
          pcie_slots: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          tdp?: number
          socket?: string
          chipset?: string
          max_memory?: number
          memory_slots?: number
          pcie_slots?: number
          created_at?: string
          updated_at?: string
        }
      }
      memory: {
        Row: {
          id: string
          name: string
          tdp: number
          capacity: number
          speed: number
          type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          tdp: number
          capacity: number
          speed: number
          type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          tdp?: number
          capacity?: number
          speed?: number
          type?: string
          created_at?: string
          updated_at?: string
        }
      }
      storage: {
        Row: {
          id: string
          name: string
          tdp: number
          capacity: number
          type: string
          interface: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          tdp: number
          capacity: number
          type: string
          interface: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          tdp?: number
          capacity?: number
          type?: string
          interface?: string
          created_at?: string
          updated_at?: string
        }
      }
      eol: {
        Row: {
          id: string
          modelname: string
          status: string | null
          eolnotice: string | null
          lastbuy: string | null
          lastshipment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          modelname: string
          status?: string | null
          eolnotice?: string | null
          lastbuy?: string | null
          lastshipment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          modelname?: string
          status?: string | null
          eolnotice?: string | null
          lastbuy?: string | null
          lastshipment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      fru: {
        Row: {
          id: string
          modelname: string
          item: string | null
          pn: string | null
          description: string | null
          remark: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          modelname: string
          item?: string | null
          pn?: string | null
          description?: string | null
          remark?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          modelname?: string
          item?: string | null
          pn?: string | null
          description?: string | null
          remark?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      gpucompatibility: {
        Row: {
          id: string
          modelname: string
          qty: string | null
          gpudetaileddescription: string | null
          gpu: string | null
          gputdp: string | null
          gpuarchitecture: string | null
          gpucertifiedlink: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          modelname: string
          qty?: string | null
          gpudetaileddescription?: string | null
          gpu?: string | null
          gputdp?: string | null
          gpuarchitecture?: string | null
          gpucertifiedlink?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          modelname?: string
          qty?: string | null
          gpudetaileddescription?: string | null
          gpu?: string | null
          gputdp?: string | null
          gpuarchitecture?: string | null
          gpucertifiedlink?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      oscompatibility: {
        Row: {
          id: string
          modelname: string
          formfactor: string | null
          oscpu: string | null
          osversion: string | null
          ossupportstatement: string | null
          oscertificationlink: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          modelname: string
          formfactor?: string | null
          oscpu?: string | null
          osversion?: string | null
          ossupportstatement?: string | null
          oscertificationlink?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          modelname?: string
          formfactor?: string | null
          oscpu?: string | null
          osversion?: string | null
          ossupportstatement?: string | null
          oscertificationlink?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      kccertification: {
        Row: {
          id: string
          modelname: string
          kccertification: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          modelname: string
          kccertification?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          modelname?: string
          kccertification?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      spm: {
        Row: {
          id: string
          modelname: string
          spm: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          modelname: string
          spm?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          modelname?: string
          spm?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      officialsite: {
        Row: {
          id: string
          modelname: string
          detailpage: string | null
          datasheet: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          modelname: string
          detailpage?: string | null
          datasheet?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          modelname?: string
          detailpage?: string | null
          datasheet?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    ? (Database["public"]["Tables"] & Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof Database["public"]["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof Database["public"]["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends keyof Database["public"]["Enums"] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never

// Type aliases for easier use
export type Profile = Tables<"profiles">
export type Post = Tables<"posts">
export type Board = Tables<"boards">
export type Comment = Tables<"comments">
export type Like = Tables<"likes">
export type Component = Tables<"components">
export type CPU = Tables<"cpus">
export type GPU = Tables<"gpus">
export type Motherboard = Tables<"motherboards">
export type Memory = Tables<"memory">
export type Storage = Tables<"storage">

// New product information types
export type EOL = Tables<"eol">
export type FRU = Tables<"fru">
export type GPUCompatibility = Tables<"gpucompatibility">
export type OSCompatibility = Tables<"oscompatibility">
export type KCCertification = Tables<"kccertification">
export type SPM = Tables<"spm">
export type OfficialSite = Tables<"officialsite">
